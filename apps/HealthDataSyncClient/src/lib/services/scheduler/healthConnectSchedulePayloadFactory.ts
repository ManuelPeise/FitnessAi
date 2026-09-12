import {
  AggregateResult,
  AggregateResultRecordType,
  ReadRecordsResult,
  RecordResult,
} from 'react-native-health-connect';
import { databaseAccessor } from '../../database/database';
import {
  HealthConnectMetricMappingTableEntry,
  HealthConnectOriginMappingTableEntry,
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { healthConnectService } from '../healthConnect/healthConnectService';
import {
  HealthConnectExportRequest,
  HealthConnectExportPayload,
  HealthConnectScheduleData,
} from './scheduleTypes';
import { getResource } from '../../localization';
import {
  HealthConnectAggregatedData,
  HealthConnectDailyDataModel,
  HealthConnectLength,
  HealthConnectMetricActiveStateMap,
  HealthConnectMetricMappingMap,
  HealthConnectOriginMappingMap,
  HealthConnectReadRange as HealthConnectMetricTimeRange,
  HealthConnectTrainingDataRecordData,
} from '../healthConnect/healthConnectTypes';
import { utils } from '../../utils';
import { utilsHealthConnect } from '../../utils.healthConnect';

// Record types with no Health Connect aggregate support — read as raw
// instantaneous records and averaged manually instead of via getAggregateResult.
type RawMetricRecordType =
  | 'BodyFat'
  | 'OxygenSaturation'
  | 'RespiratoryRate'
  | 'Vo2Max';

class HealthConnectSchedulePayloadFactory {
  private readonly databaseService = databaseAccessor;

  create = async (
    userId: number,
    request: HealthConnectExportRequest,
  ): Promise<HealthConnectExportPayload> => {
    try {
      if (request.type !== 'HealthConnectHealthDataExport') {
        throw new Error(
          `${getResource(
            'healthConnect.descriptionUnsupportedExportRequestTypePrefix',
          )}: ${request.type}`,
        );
      }

      const scheduleData = await this.getHealthConnectScheduleData(
        userId,
        'HealthConnectHealthDataExport',
      );

      const payload = await this.getHealthDataExportPayload(
        request,
        scheduleData?.originMappings ?? [],
        scheduleData?.metricMappings ?? [],
      );

      return { scheduler: scheduleData, dailyDataModels: payload };
    } catch (error) {
      console.error(
        `${getResource(
          'healthConnect.descriptionPayloadFactoryFailedPrefix',
        )} "${userId}" and type "${request.type}".`,
        error,
      );
      return { scheduler: null, dailyDataModels: [] };
    }
  };

  private getHealthDataExportPayload = async (
    request: HealthConnectExportRequest,
    originMappings: HealthConnectOriginMappingTableEntry[],
    metricMappings: HealthConnectMetricMappingTableEntry[],
  ): Promise<HealthConnectDailyDataModel[]> => {
    const dataSets: HealthConnectDailyDataModel[] = [];

    const datesToProcess = utils.getDatesFromRange(request.from, request.to);
    const originMappingMap = this.getActiveOriginMappingMap(originMappings);
    const metricMappingMap = this.getActiveMetricMappingMap(metricMappings);

    const activeMetricMappingMap: HealthConnectMetricActiveStateMap = {};

    Object.values(metricMappingMap).forEach(key => {
      const metricMapping = metricMappingMap[key.source];

      if (this.isActiveMetric(metricMapping)) {
        activeMetricMappingMap[metricMapping.source] = true;
      }
    });

    for (const date of datesToProcess) {
      const dailyData: HealthConnectDailyDataModel = {
        date: date.toISOString(),
        aggregatedData: await this.getAggregatedDataForDate(
          date.toISOString(),
          originMappingMap,
          metricMappingMap,
          activeMetricMappingMap,
        ),
        trainingData: await this.getTrainingDataForDate(
          date.toISOString(),
          originMappingMap,
          metricMappingMap,
          activeMetricMappingMap,
        ),
      };

      dataSets.push(dailyData);
    }
    return dataSets;
  };

  private getHealthConnectScheduleData = async (
    userId: number,
    scheduleType: ScheduleSettingsType,
  ): Promise<HealthConnectScheduleData | null> => {
    const schedule = await this.getHealthConnectSchedule(userId, scheduleType);

    if (!schedule) {
      return null;
    }

    const scheduleData: HealthConnectScheduleData = {
      originMappings: await this.getActiveOriginMappings(userId),
      metricMappings: await this.getActiveMetricMappings(userId),
      schedule,
    };

    return scheduleData;
  };

  private async getActiveMetricMappings(
    userId: number,
  ): Promise<HealthConnectMetricMappingTableEntry[]> {
    const mappings =
      await this.databaseService.metricMappingTable.getMappingEntries(userId);
    return mappings.filter(mapping => mapping.isActive);
  }

  private getActiveMetricMappingMap = (
    metricMappings: HealthConnectMetricMappingTableEntry[],
  ): HealthConnectMetricMappingMap => {
    const mappingMap: HealthConnectMetricMappingMap = {};

    metricMappings.forEach(mapping => {
      mappingMap[mapping.source] = mapping;
    });
    return mappingMap;
  };

  private async getActiveOriginMappings(
    userId: number,
  ): Promise<HealthConnectOriginMappingTableEntry[]> {
    const mappings =
      await this.databaseService.originMappingTable.getMappingEntries(userId);
    return mappings.filter(mapping => mapping.isActive);
  }

  private getActiveOriginMappingMap = (
    originMappings: HealthConnectOriginMappingTableEntry[],
  ): HealthConnectOriginMappingMap => {
    const mappingMap: HealthConnectOriginMappingMap = {};
    originMappings.forEach(mapping => {
      mappingMap[mapping.source] = mapping;
    });
    return mappingMap;
  };

  private getHealthConnectSchedule = async (
    userId: number,
    type: ScheduleSettingsType,
  ): Promise<ScheduleSettingsTableEntry | null> => {
    const schedule = await this.databaseService.schedule.getSchedule(
      userId,
      type,
    );

    return schedule;
  };

  private async getAggregatedDataForDate(
    date: string,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap,
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
  ): Promise<HealthConnectAggregatedData> {
    const dateObj = new Date(date);
    const dayRange: HealthConnectMetricTimeRange = {
      startTime: utils.getStartOfDay(dateObj),
      endTime: utils.getEndOfDay(dateObj),
    };
    const fetchMetric = (key: AggregateResultRecordType) =>
      this.getValue(
        dayRange,
        key,
        this.getOriginsForMetric(key, originMappingMap, metricMappingMap),
      );

    const results = await utilsHealthConnect.fetchActiveMetrics([
      {
        key: 'HeartRate',
        isActive: metricActiveStateMap.HeartRate === true,
        fetch: () => fetchMetric('HeartRate'),
      },
      {
        key: 'RestingHeartRate',
        isActive: metricActiveStateMap.RestingHeartRate === true,
        fetch: () => fetchMetric('RestingHeartRate'),
      },
      {
        key: 'SleepSession',
        isActive: metricActiveStateMap.SleepSession === true,
        fetch: () => fetchMetric('SleepSession'),
      },
      {
        key: 'FloorsClimbed',
        isActive: metricActiveStateMap.FloorsClimbed === true,
        fetch: () => fetchMetric('FloorsClimbed'),
      },
      {
        key: 'BasalMetabolicRate',
        isActive: metricActiveStateMap.BasalMetabolicRate === true,
        fetch: () => fetchMetric('BasalMetabolicRate'),
      },
      {
        key: 'ActiveCaloriesBurned',
        isActive: metricActiveStateMap.ActiveCaloriesBurned === true,
        fetch: () => fetchMetric('ActiveCaloriesBurned'),
      },
      {
        key: 'TotalCaloriesBurned',
        isActive: metricActiveStateMap.TotalCaloriesBurned === true,
        fetch: () => fetchMetric('TotalCaloriesBurned'),
      },
      {
        key: 'Weight',
        isActive: metricActiveStateMap.Weight === true,
        fetch: () => fetchMetric('Weight'),
      },
      {
        key: 'Steps',
        isActive: metricActiveStateMap.Steps === true,
        fetch: () => fetchMetric('Steps'),
      },
      {
        key: 'Hydration',
        isActive: metricActiveStateMap.Hydration === true,
        fetch: () => fetchMetric('Hydration'),
      },
      {
        key: 'BloodPressure',
        isActive: metricActiveStateMap.BloodPressure === true,
        fetch: () => fetchMetric('BloodPressure'),
      },
      {
        key: 'WheelchairPushes',
        isActive: metricActiveStateMap.WheelchairPushes === true,
        fetch: () => fetchMetric('WheelchairPushes'),
      },
      {
        key: 'Height',
        isActive: metricActiveStateMap.Height === true,
        fetch: () => fetchMetric('Height'),
      },
      {
        key: 'Nutrition',
        isActive: metricActiveStateMap.Nutrition === true,
        fetch: () => fetchMetric('Nutrition'),
      },
      {
        key: 'BodyFat',
        isActive: metricActiveStateMap.BodyFat === true,
        fetch: () =>
          this.readRawMetric(
            'BodyFat',
            dayRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
      {
        key: 'OxygenSaturation',
        isActive: metricActiveStateMap.OxygenSaturation === true,
        fetch: () =>
          this.readRawMetric(
            'OxygenSaturation',
            dayRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
      {
        key: 'RespiratoryRate',
        isActive: metricActiveStateMap.RespiratoryRate === true,
        fetch: () =>
          this.readRawMetric(
            'RespiratoryRate',
            dayRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
      {
        key: 'Vo2Max',
        isActive: metricActiveStateMap.Vo2Max === true,
        fetch: () =>
          this.readRawMetric(
            'Vo2Max',
            dayRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
    ]);

    const heartRateResult = results.HeartRate as
      | AggregateResult<'HeartRate'>
      | undefined;
    const restingHeartRateResult = results.RestingHeartRate as
      | AggregateResult<'RestingHeartRate'>
      | undefined;
    const sleepResult = results.SleepSession as
      | AggregateResult<'SleepSession'>
      | undefined;
    const floorsClimbedResult = results.FloorsClimbed as
      | AggregateResult<'FloorsClimbed'>
      | undefined;
    const basalMetabolicRateResult = results.BasalMetabolicRate as
      | AggregateResult<'BasalMetabolicRate'>
      | undefined;
    const activeCaloriesResult = results.ActiveCaloriesBurned as
      | AggregateResult<'ActiveCaloriesBurned'>
      | undefined;
    const totalCaloriesResult = results.TotalCaloriesBurned as
      | AggregateResult<'TotalCaloriesBurned'>
      | undefined;
    const weightResult = results.Weight as
      | AggregateResult<'Weight'>
      | undefined;
    const stepsResult = results.Steps as AggregateResult<'Steps'> | undefined;
    const hydrationResult = results.Hydration as
      | AggregateResult<'Hydration'>
      | undefined;
    const bloodPressureResult = results.BloodPressure as
      | AggregateResult<'BloodPressure'>
      | undefined;
    const wheelchairPushesResult = results.WheelchairPushes as
      | AggregateResult<'WheelchairPushes'>
      | undefined;
    const heightResult = results.Height as
      | AggregateResult<'Height'>
      | undefined;
    const nutritionResult = results.Nutrition as
      | AggregateResult<'Nutrition'>
      | undefined;
    const bodyFatResult = results.BodyFat as
      | ReadRecordsResult<'BodyFat'>
      | undefined;
    const oxygenSaturationResult = results.OxygenSaturation as
      | ReadRecordsResult<'OxygenSaturation'>
      | undefined;
    const respiratoryRateResult = results.RespiratoryRate as
      | ReadRecordsResult<'RespiratoryRate'>
      | undefined;
    const vo2MaxResult = results.Vo2Max as
      | ReadRecordsResult<'Vo2Max'>
      | undefined;

    return {
      source: 'HealthConnectSyncClient',
      endTime: utils.getEndOfDay(dateObj).toISOString(),
      startTime: utils.getStartOfDay(dateObj).toISOString(),
      activeCaloriesBurnedInKcal:
        activeCaloriesResult?.ACTIVE_CALORIES_TOTAL.inKilocalories ?? null,
      totalCaloriesBurnedInKcal:
        totalCaloriesResult?.ENERGY_TOTAL.inKilocalories ?? null,
      heartRate: {
        avg: heartRateResult?.BPM_AVG ?? null,
        max: heartRateResult?.BPM_MAX ?? null,
        min: heartRateResult?.BPM_MIN ?? null,
      },
      hydrationAvg: hydrationResult?.VOLUME_TOTAL.inMilliliters ?? null,
      restingHeartRate: {
        avg: restingHeartRateResult?.BPM_AVG ?? null,
        max: restingHeartRateResult?.BPM_MAX ?? null,
        min: restingHeartRateResult?.BPM_MIN ?? null,
      },
      steps: stepsResult?.COUNT_TOTAL ?? null,
      weightAvg: weightResult?.WEIGHT_AVG.inKilograms ?? null,
      sleepDurationInSeconds: sleepResult?.SLEEP_DURATION_TOTAL ?? null,
      floorsClimbed: floorsClimbedResult?.FLOORS_CLIMBED_TOTAL ?? null,
      basalMetabolicRateInKcal:
        basalMetabolicRateResult?.BASAL_CALORIES_TOTAL.inKilocalories ?? null,
      bloodPressure: {
        diastolic:
          bloodPressureResult?.DIASTOLIC_AVG.inMillimetersOfMercury ?? null,
        systolic:
          bloodPressureResult?.SYSTOLIC_AVG.inMillimetersOfMercury ?? null,
      },
      wheelchairPushes: wheelchairPushesResult?.COUNT_TOTAL ?? null,
      heightInMeters: heightResult?.HEIGHT_AVG.inMeters ?? null,
      bodyFatPercentageAvg: this.averageRecordField(
        bodyFatResult ?? null,
        record => record.percentage,
      ),
      caloriesKcal: nutritionResult?.ENERGY_TOTAL.inKilocalories ?? null,
      proteinGrams: nutritionResult?.PROTEIN_TOTAL.inGrams ?? null,
      carbohydratesGrams:
        nutritionResult?.TOTAL_CARBOHYDRATE_TOTAL.inGrams ?? null,
      fatGrams: nutritionResult?.TOTAL_FAT_TOTAL.inGrams ?? null,
      fiberGrams: nutritionResult?.DIETARY_FIBER_TOTAL.inGrams ?? null,
      sugarGrams: nutritionResult?.SUGAR_TOTAL.inGrams ?? null,
      oxygenSaturationPercentageAvg: this.averageRecordField(
        oxygenSaturationResult ?? null,
        record => record.percentage,
      ),
      respiratoryRateAvg: this.averageRecordField(
        respiratoryRateResult ?? null,
        record => record.rate,
      ),
      vo2MaxMlPerMinKgAvg: this.averageRecordField(
        vo2MaxResult ?? null,
        record => record.vo2MillilitersPerMinuteKilogram,
      ),
    };
  }

  private async getTrainingDataForDate(
    date: string,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap,
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
  ): Promise<HealthConnectTrainingDataRecordData[]> {
    const trainingData: HealthConnectTrainingDataRecordData[] = [];

    const origins = this.getOriginsForMetric(
      'ExerciseSession',
      originMappingMap,
      metricMappingMap,
    );
    const exercises = await healthConnectService.readExerciseSessions(
      {
        startTime: utils.getStartOfDay(new Date(date)),
        endTime: utils.getEndOfDay(new Date(date)),
      },
      origins,
    );

    if (!exercises || !exercises.records || exercises.records.length === 0) {
      return trainingData;
    }

    const originTargetValues = origins.map(o => {
      const mapping = originMappingMap[o];
      return mapping?.target ?? 'HealthConnectSyncClient';
    });

    const originNamesAsString = utils.getArrayValuesAsString(
      originTargetValues,
      o => o,
    );

    for (const record of exercises.records) {
      const trainingEntry: HealthConnectTrainingDataRecordData | null =
        await this.getTrainingDataEntry(
          record,
          originMappingMap,
          metricMappingMap,
          metricActiveStateMap,
          originNamesAsString,
        );

      if (trainingEntry) {
        trainingData.push(trainingEntry);
      }
    }

    return trainingData;
  }

  private async getTrainingDataEntry(
    record: RecordResult<'ExerciseSession'>,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap,
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
    originNamesAsString: string,
  ): Promise<HealthConnectTrainingDataRecordData | null> {
    if (!originMappingMap) {
      return null;
    }

    // The exercise session's own time range, not the whole day - otherwise
    // Avg/Min get diluted by resting heart rate outside the workout (Max
    // still looks right by coincidence, since the day's peak is usually
    // still set during the workout).
    const sessionRange: HealthConnectMetricTimeRange = {
      startTime: record.startTime,
      endTime: record.endTime,
    };
    const fetchMetric = (key: AggregateResultRecordType) =>
      this.getValue(
        sessionRange,
        key,
        this.getOriginsForMetric(key, originMappingMap, metricMappingMap),
      );

    const results = await utilsHealthConnect.fetchActiveMetrics([
      {
        key: 'Distance',
        isActive: metricActiveStateMap.Distance === true,
        fetch: () => fetchMetric('Distance'),
      },
      {
        key: 'Steps',
        isActive: metricActiveStateMap.Steps === true,
        fetch: () => fetchMetric('Steps'),
      },
      {
        key: 'ActiveCaloriesBurned',
        isActive: metricActiveStateMap.ActiveCaloriesBurned === true,
        fetch: () => fetchMetric('ActiveCaloriesBurned'),
      },
      {
        key: 'HeartRate',
        isActive: metricActiveStateMap.HeartRate === true,
        fetch: () => fetchMetric('HeartRate'),
      },
      {
        key: 'Speed',
        isActive: metricActiveStateMap.Speed === true,
        fetch: () => fetchMetric('Speed'),
      },
      {
        key: 'ElevationGained',
        isActive: metricActiveStateMap.ElevationGained === true,
        fetch: () => fetchMetric('ElevationGained'),
      },
      {
        key: 'Power',
        isActive: metricActiveStateMap.Power === true,
        fetch: () => fetchMetric('Power'),
      },
      {
        key: 'CyclingPedalingCadence',
        isActive: metricActiveStateMap.CyclingPedalingCadence === true,
        fetch: () => fetchMetric('CyclingPedalingCadence'),
      },
      {
        key: 'Hydration',
        isActive: metricActiveStateMap.Hydration === true,
        fetch: () => fetchMetric('Hydration'),
      },
      {
        key: 'RestingHeartRate',
        isActive: metricActiveStateMap.RestingHeartRate === true,
        fetch: () => fetchMetric('RestingHeartRate'),
      },
      {
        key: 'StepsCadence',
        isActive: metricActiveStateMap.StepsCadence === true,
        fetch: () => fetchMetric('StepsCadence'),
      },
      {
        key: 'Weight',
        isActive: metricActiveStateMap.Weight === true,
        fetch: () => fetchMetric('Weight'),
      },
      {
        key: 'BodyFat',
        isActive: metricActiveStateMap.BodyFat === true,
        fetch: () =>
          this.readRawMetric(
            'BodyFat',
            sessionRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
      {
        key: 'OxygenSaturation',
        isActive: metricActiveStateMap.OxygenSaturation === true,
        fetch: () =>
          this.readRawMetric(
            'OxygenSaturation',
            sessionRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
      {
        key: 'RespiratoryRate',
        isActive: metricActiveStateMap.RespiratoryRate === true,
        fetch: () =>
          this.readRawMetric(
            'RespiratoryRate',
            sessionRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
      {
        key: 'Vo2Max',
        isActive: metricActiveStateMap.Vo2Max === true,
        fetch: () =>
          this.readRawMetric(
            'Vo2Max',
            sessionRange,
            originMappingMap,
            metricMappingMap,
          ),
      },
    ]);

    const distanceResult = results.Distance as
      | AggregateResult<'Distance'>
      | undefined;
    const stepsResult = results.Steps as AggregateResult<'Steps'> | undefined;
    const activeCaloriesBurnedResult = results.ActiveCaloriesBurned as
      | AggregateResult<'ActiveCaloriesBurned'>
      | undefined;
    const heartRateResult = results.HeartRate as
      | AggregateResult<'HeartRate'>
      | undefined;
    const speedResult = results.Speed as AggregateResult<'Speed'> | undefined;
    const elevationResult = results.ElevationGained as
      | AggregateResult<'ElevationGained'>
      | undefined;
    const powerResult = results.Power as AggregateResult<'Power'> | undefined;
    const cyclingPedalingCadenceResult = results.CyclingPedalingCadence as
      | AggregateResult<'CyclingPedalingCadence'>
      | undefined;
    const hydrationResult = results.Hydration as
      | AggregateResult<'Hydration'>
      | undefined;
    const restingHeartRateResult = results.RestingHeartRate as
      | AggregateResult<'RestingHeartRate'>
      | undefined;
    const stepsCadenceResult = results.StepsCadence as
      | AggregateResult<'StepsCadence'>
      | undefined;
    const weightResult = results.Weight as
      | AggregateResult<'Weight'>
      | undefined;
    const bodyFatResult =
      (results.BodyFat as ReadRecordsResult<'BodyFat'> | undefined) ?? null;
    const oxygenSaturationResult =
      (results.OxygenSaturation as
        | ReadRecordsResult<'OxygenSaturation'>
        | undefined) ?? null;
    const respiratoryRateResult =
      (results.RespiratoryRate as
        | ReadRecordsResult<'RespiratoryRate'>
        | undefined) ?? null;
    const vo2MaxResult =
      (results.Vo2Max as ReadRecordsResult<'Vo2Max'> | undefined) ?? null;

    const model: HealthConnectTrainingDataRecordData = {
      exerciseMetricId: record.metadata?.id,
      startTime: record.startTime,
      endTime: record.endTime,
      exerciseType: record.exerciseType,
      origin: record.metadata?.dataOrigin ?? 'HealthConnectSyncClient',
      system: originNamesAsString,
      timeZoneInfo: record.startZoneOffset
        ? {
            offset: record.startZoneOffset?.totalSeconds ?? 0,
            id: record.startZoneOffset?.id ?? '',
          }
        : null,
      durationSeconds: utils.getDurationSeconds(
        record.startTime,
        record.endTime,
      ),
      distanceInMeters: distanceResult?.DISTANCE.inMeters ?? null,
      steps: stepsResult?.COUNT_TOTAL ?? null,
      activeCaloriesBurnedInKcal:
        activeCaloriesBurnedResult?.ACTIVE_CALORIES_TOTAL?.inKilocalories ??
        null,
      heartRate: {
        avg: heartRateResult?.BPM_AVG ?? null,
        min: heartRateResult?.BPM_MIN ?? null,
        max: heartRateResult?.BPM_MAX ?? null,
      },
      speed: {
        avg: speedResult?.SPEED_AVG.inKilometersPerHour ?? null,
        min: speedResult?.SPEED_MIN.inKilometersPerHour ?? null,
        max: speedResult?.SPEED_MAX.inKilometersPerHour ?? null,
      },
      elevationAvg: elevationResult?.ELEVATION_GAINED_TOTAL.inMeters ?? null,
      power: {
        avg: powerResult?.POWER_AVG.inWatts ?? null,
        min: powerResult?.POWER_MIN.inWatts ?? null,
        max: powerResult?.POWER_MAX.inWatts ?? null,
      },
      cyclingPedalingCadence: {
        avg: cyclingPedalingCadenceResult?.RPM_AVG ?? null,
        min: cyclingPedalingCadenceResult?.RPM_MIN ?? null,
        max: cyclingPedalingCadenceResult?.RPM_MAX ?? null,
      },
      hydrationAvg: hydrationResult?.VOLUME_TOTAL.inMilliliters ?? null,
      restingHeartRate: {
        avg: restingHeartRateResult?.BPM_AVG ?? null,
        min: restingHeartRateResult?.BPM_MIN ?? null,
        max: restingHeartRateResult?.BPM_MAX ?? null,
      },
      stepCadence: {
        avg: stepsCadenceResult?.RATE_AVG ?? null,
        min: stepsCadenceResult?.RATE_MIN ?? null,
        max: stepsCadenceResult?.RATE_MAX ?? null,
      },
      weightAvg: weightResult?.WEIGHT_AVG.inKilograms ?? null,
      bodyFatPercentageAvg: this.averageRecordField(
        bodyFatResult,
        r => r.percentage,
      ),
      oxygenSaturationPercentageAvg: this.averageRecordField(
        oxygenSaturationResult,
        r => r.percentage,
      ),
      respiratoryRateAvg: this.averageRecordField(
        respiratoryRateResult,
        r => r.rate,
      ),
      vo2MaxMlPerMinKgAvg: this.averageRecordField(
        vo2MaxResult,
        r => r.vo2MillilitersPerMinuteKilogram,
      ),
      notes: record.notes ?? null,
      segments: record.segments?.length
        ? record.segments.map(s => {
            return {
              segmentType: s.segmentType,
              repetitions: s.repetitions,
              startTime: s.startTime,
              endTime: s.endTime,
            };
          })
        : [],
      laps: record.laps?.length
        ? record.laps.map(lap => {
            const length = lap.length as unknown as HealthConnectLength;
            return {
              startTime: lap.startTime,
              endTime: lap.endTime,
              lengthInMeters: length.inMeters,
            };
          })
        : [],
    };

    return model;
  }

  private isActiveMetric(
    metricMapping: HealthConnectMetricMappingTableEntry,
  ): boolean {
    return metricMapping.isActive;
  }

  private async getValue<TMetricResult extends AggregateResultRecordType>(
    range: HealthConnectMetricTimeRange,
    record: TMetricResult,
    origens: string[],
  ): Promise<AggregateResult<TMetricResult>> {
    return await healthConnectService.getAggregateResult<TMetricResult>(
      record,
      range,
      origens,
    );
  }

  private async readRawMetric<T extends RawMetricRecordType>(
    recordType: T,
    range: HealthConnectMetricTimeRange,
    originMappingMap: HealthConnectOriginMappingMap | null,
    metricMappingMap: HealthConnectMetricMappingMap,
  ): Promise<ReadRecordsResult<T> | null> {
    if (!metricMappingMap[recordType]?.isActive) {
      return null;
    }

    return await healthConnectService.readMetric(
      recordType,
      range,
      this.getOriginsForMetric(recordType, originMappingMap, metricMappingMap),
    );
  }

  private averageRecordField<T extends RawMetricRecordType>(
    result: ReadRecordsResult<T> | null,
    getValue: (record: RecordResult<T>) => number | null | undefined,
  ): number | null {
    if (!result?.records?.length) {
      return null;
    }

    const total = result.records.reduce(
      (sum, record) => sum + (getValue(record) ?? 0),
      0,
    );
    return total / result.records.length;
  }

  private getOriginsForMetric(
    key: AggregateResultRecordType | RawMetricRecordType,
    originMappingMappingMap: HealthConnectOriginMappingMap | null,
    metricMappingMap: HealthConnectMetricMappingMap,
  ): string[] {
    const origins: string[] = [];

    if (originMappingMappingMap == null) {
      return origins;
    }

    // origin mappings link to a metric via metricIds, not via the record type key directly
    const metricMapping = metricMappingMap[key];

    if (!metricMapping) {
      return origins;
    }

    for (const mappingKey in originMappingMappingMap) {
      const originMapping = originMappingMappingMap[mappingKey];
      if (
        originMapping.isActive &&
        (originMapping.metricIds ?? []).includes(metricMapping.id)
      ) {
        origins.push(originMapping.source);
      }
    }
    return origins;
  }
}

export const healthConnectSchedulePayloadFactory =
  new HealthConnectSchedulePayloadFactory();
