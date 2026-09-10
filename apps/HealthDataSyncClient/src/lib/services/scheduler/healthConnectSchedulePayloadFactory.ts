import {
  AggregateResult,
  AggregateResultRecordType,
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
  HealthConnectMetricActiveStateMap,
  HealthConnectMetricMappingMap,
  HealthConnectOriginMappingMap,
  HealthConnectTrainingDataRecordData,
} from '../healthConnect/healthConnectTypes';
import { utils } from '../../utils';

class HealthConnectSchedulePayloadFactory {
  private readonly databaseService = databaseAccessor;
  private readonly healthConnect = healthConnectService;

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

    metricMappingMap.forEach(metric => {
      if (this.isActiveMetric(metric.mapping)) {
        activeMetricMappingMap[metric.key] = true;
      }
    });

    for (const date of datesToProcess) {
      const dailyData: HealthConnectDailyDataModel = {
        date,
        aggregatedData: await this.getAggregatedDataForDate(
          date,
          originMappingMap,
          metricMappingMap,
          activeMetricMappingMap,
        ),
        trainingData: await this.getTrainingDataForDate(
          date,
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
  ): HealthConnectMetricMappingMap[] => {
    const mappingMap: HealthConnectMetricMappingMap[] = [];

    metricMappings.forEach(mapping => {
      mappingMap.push({
        key: mapping.source as AggregateResultRecordType,
        mapping: mapping,
      });
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
    date: Date,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap[],
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
  ): Promise<HealthConnectAggregatedData> {
    const mapping = (key: string) =>
      metricMappingMap.find(m => m.key === key)?.mapping;

    const heartRateResult = metricActiveStateMap['heartRate']
      ? await this.getValueOrNull(
          date,
          'HeartRate',
          mapping('HeartRate') ?? null,
          this.getOriginsForMetric('HeartRate', originMappingMap),
        )
      : null;

    const restingHeartRateResult = metricActiveStateMap['restingHeartRate']
      ? await this.getValueOrNull(
          date,
          'RestingHeartRate',
          mapping('RestingHeartRate') ?? null,
          this.getOriginsForMetric('RestingHeartRate', originMappingMap),
        )
      : null;

    const sleepResult = metricActiveStateMap['sleepDurationInSeconds']
      ? await this.getValueOrNull(
          date,
          'SleepSession',
          mapping('SleepSession') ?? null,
          this.getOriginsForMetric('SleepSession', originMappingMap),
        )
      : null;

    const floorsClimbedResult = metricActiveStateMap['floorsClimbed']
      ? await this.getValueOrNull(
          date,
          'FloorsClimbed',
          mapping('FloorsClimbed') ?? null,
          this.getOriginsForMetric('FloorsClimbed', originMappingMap),
        )
      : null;

    const basalMetabolicRateResult = metricActiveStateMap['basalMetabolicRate']
      ? await this.getValueOrNull(
          date,
          'BasalMetabolicRate',
          mapping('BasalMetabolicRate') ?? null,
          this.getOriginsForMetric('BasalMetabolicRate', originMappingMap),
        )
      : null;

    const activeCaloriesResult = metricActiveStateMap['calories']
      ? await this.getValueOrNull(
          date,
          'ActiveCaloriesBurned',
          mapping('ActiveCaloriesBurned') ?? null,
          this.getOriginsForMetric('ActiveCaloriesBurned', originMappingMap),
        )
      : null;

    const totalCaloriesResult = metricActiveStateMap['calories']
      ? await this.getValueOrNull(
          date,
          'TotalCaloriesBurned',
          mapping('TotalCaloriesBurned') ?? null,
          this.getOriginsForMetric('TotalCaloriesBurned', originMappingMap),
        )
      : null;

    const weightResult = metricActiveStateMap['weight']
      ? await this.getValueOrNull(
          date,
          'Weight',
          mapping('Weight') ?? null,
          this.getOriginsForMetric('Weight', originMappingMap),
        )
      : null;

    const stepsResult = metricActiveStateMap['steps']
      ? await this.getValueOrNull(
          date,
          'Steps',
          mapping('Steps') ?? null,
          this.getOriginsForMetric('Steps', originMappingMap),
        )
      : null;

    const hydrationResult = metricActiveStateMap['hydration']
      ? await this.getValueOrNull(
          date,
          'Hydration',
          mapping('Hydration') ?? null,
          this.getOriginsForMetric('Hydration', originMappingMap),
        )
      : null;

    const bloodPressureResult = metricActiveStateMap['bloodPressure']
      ? await this.getValueOrNull(
          date,
          'BloodPressure',
          mapping('BloodPressure') ?? null,
          this.getOriginsForMetric('BloodPressure', originMappingMap),
        )
      : null;

    const wheelchairPushesResult = metricActiveStateMap['wheelchairPushes']
      ? await this.getValueOrNull(
          date,
          'WheelchairPushes',
          mapping('WheelchairPushes') ?? null,
          this.getOriginsForMetric('WheelchairPushes', originMappingMap),
        )
      : null;

    const heightResult = metricActiveStateMap['height']
      ? await this.getValueOrNull(
          date,
          'Height',
          mapping('Height') ?? null,
          this.getOriginsForMetric('Height', originMappingMap),
        )
      : null;

    return {
      source: 'HealthConnectSyncClient',
      endTime: utils.getEndOfDay(date),
      startTime: utils.getStartOfDay(date),
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
    };
  }

  private async getTrainingDataForDate(
    date: Date,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap[],
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
  ): Promise<HealthConnectTrainingDataRecordData[]> {
    const trainingData: HealthConnectTrainingDataRecordData[] = [];

    const exercises = await healthConnectService.readExerciseSessions({
      startTime: utils.getStartOfDay(date),
      endTime: utils.getEndOfDay(date),
    });

    if (!exercises || !exercises.records || exercises.records.length === 0) {
      return trainingData;
    }

    for (const record of exercises.records) {
      const trainingEntry: HealthConnectTrainingDataRecordData | null =
        await this.getTrainingDataEntry(
          date,
          record,
          originMappingMap,
          metricMappingMap,
          metricActiveStateMap,
        );

      if (trainingEntry) {
        trainingData.push(trainingEntry);
      }
    }

    return trainingData;
  }

  private async getTrainingDataEntry(
    date: Date,
    record: RecordResult<'ExerciseSession'>,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap[],
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
  ): Promise<HealthConnectTrainingDataRecordData | null> {
    if (!originMappingMap) {
      return null;
    }

    const mapping = (key: string) =>
      metricMappingMap.find(m => m.key === key)?.mapping;

    const distanceResult = metricActiveStateMap['Distance']
      ? await this.getValueOrNull(
          date,
          'Distance',
          mapping('Distance') ?? null,
          this.getOriginsForMetric('Distance', originMappingMap),
        )
      : null;
    const stepsResult = metricActiveStateMap['Steps']
      ? await this.getValueOrNull(
          date,
          'Steps',
          mapping('Steps') ?? null,
          this.getOriginsForMetric('Steps', originMappingMap),
        )
      : null;
    const activeCaloriesBurnedResult = metricActiveStateMap[
      'ActiveCaloriesBurned'
    ]
      ? await this.getValueOrNull(
          date,
          'ActiveCaloriesBurned',
          mapping('ActiveCaloriesBurned') ?? null,
          this.getOriginsForMetric('ActiveCaloriesBurned', originMappingMap),
        )
      : null;
    const totalCaloriesBurnedResult = metricActiveStateMap[
      'TotalCaloriesBurned'
    ]
      ? await this.getValueOrNull(
          date,
          'TotalCaloriesBurned',
          mapping('TotalCaloriesBurned') ?? null,
          this.getOriginsForMetric('TotalCaloriesBurned', originMappingMap),
        )
      : null;
    const heartRateResult = metricActiveStateMap['HeartRate']
      ? await this.getValueOrNull(
          date,
          'HeartRate',
          mapping('HeartRate') ?? null,
          this.getOriginsForMetric('HeartRate', originMappingMap),
        )
      : null;
    const speedResult = metricActiveStateMap['Speed']
      ? await this.getValueOrNull(
          date,
          'Speed',
          mapping('Speed') ?? null,
          this.getOriginsForMetric('Speed', originMappingMap),
        )
      : null;
    const elevationResult = metricActiveStateMap['ElevationGained']
      ? await this.getValueOrNull(
          date,
          'ElevationGained',
          mapping('ElevationGained') ?? null,
          this.getOriginsForMetric('ElevationGained', originMappingMap),
        )
      : null;
    const powerResult = metricActiveStateMap['Power']
      ? await this.getValueOrNull(
          date,
          'Power',
          mapping('Power') ?? null,
          this.getOriginsForMetric('Power', originMappingMap),
        )
      : null;
    const cyclingPedalingCadenceResult = metricActiveStateMap[
      'CyclingPedalingCadence'
    ]
      ? await this.getValueOrNull(
          date,
          'CyclingPedalingCadence',
          mapping('CyclingPedalingCadence') ?? null,
          this.getOriginsForMetric('CyclingPedalingCadence', originMappingMap),
        )
      : null;
    const hydrationResult = metricActiveStateMap['Hydration']
      ? await this.getValueOrNull(
          date,
          'Hydration',
          mapping('Hydration') ?? null,
          this.getOriginsForMetric('Hydration', originMappingMap),
        )
      : null;
    const restingHeartRateResult = metricActiveStateMap['RestingHeartRate']
      ? await this.getValueOrNull(
          date,
          'RestingHeartRate',
          mapping('RestingHeartRate') ?? null,
          this.getOriginsForMetric('RestingHeartRate', originMappingMap),
        )
      : null;
    const stepsCadenceResult = metricActiveStateMap['StepsCadence']
      ? await this.getValueOrNull(
          date,
          'StepsCadence',
          mapping('StepsCadence') ?? null,
          this.getOriginsForMetric('StepsCadence', originMappingMap),
        )
      : null;
    const weightResult = metricActiveStateMap['Weight']
      ? await this.getValueOrNull(
          date,
          'Weight',
          mapping('Weight') ?? null,
          this.getOriginsForMetric('Weight', originMappingMap),
        )
      : null;

    const model: HealthConnectTrainingDataRecordData = {
      startTime: record.startTime,
      endTime: record.endTime,
      exerciseType: record.exerciseType,
      origin: 'HealthConnectSyncClient',
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
      totalCaloriesBurnedInKcal:
        totalCaloriesBurnedResult?.ENERGY_TOTAL?.inKilocalories ?? null,
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
    };

    return model;
  }

  private isActiveMetric(
    metricMapping: HealthConnectMetricMappingTableEntry,
  ): boolean {
    return metricMapping.isActive;
  }

  private async getValueOrNull<TMetricResult extends AggregateResultRecordType>(
    date: Date,
    record: TMetricResult,
    mapping: HealthConnectMetricMappingTableEntry | null,
    origens: string[],
  ): Promise<AggregateResult<TMetricResult> | null> {
    if (!mapping || !mapping.isActive) {
      return null;
    }

    const metricResult =
      await healthConnectService.getAggregateResult<TMetricResult>(
        record,
        {
          startTime: utils.getStartOfDay(date),
          endTime: utils.getEndOfDay(date),
        },
        origens,
      );
    return metricResult;
  }

  private getOriginsForMetric(
    key: AggregateResultRecordType,
    originMappingMappingMap: HealthConnectOriginMappingMap | null,
  ): string[] {
    const origins: string[] = [];

    if (!originMappingMappingMap) {
      return origins;
    }

    for (const mappingKey in originMappingMappingMap) {
      const mapping = originMappingMappingMap[mappingKey];

      if (mapping.isActive && mapping.source === key) {
        origins.push(mapping.source);
      }
    }
    return origins;
  }
}

export const healthConnectSchedulePayloadFactory =
  new HealthConnectSchedulePayloadFactory();
