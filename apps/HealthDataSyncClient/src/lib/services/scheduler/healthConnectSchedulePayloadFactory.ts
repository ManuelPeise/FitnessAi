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
  HealthConnectLength,
  HealthConnectMetricActiveStateMap,
  HealthConnectMetricMappingMap,
  HealthConnectOriginMappingMap,
  HealthConnectTrainingDataRecordData,
} from '../healthConnect/healthConnectTypes';
import { utils } from '../../utils';

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
    const origins = this.getOriginsForMetric(
      'HeartRate',
      originMappingMap,
      metricMappingMap,
    );

    const heartRateResult = metricActiveStateMap['HeartRate']
      ? await this.getValue(
          new Date(date),
          'HeartRate',
          this.getOriginsForMetric(
            'HeartRate',
            originMappingMap,
            metricMappingMap,
          ),
        )
      : null;

    console.log(
      'HeartRate result for date',
      date,
      ':',
      JSON.stringify(heartRateResult),
    );
    const restingHeartRateResult =
      metricActiveStateMap['RestingHeartRate'] === true
        ? await this.getValue(
            new Date(date),
            'RestingHeartRate',
            this.getOriginsForMetric(
              'RestingHeartRate',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const sleepResult =
      metricActiveStateMap['SleepSession'] === true
        ? await this.getValue(
            new Date(date),
            'SleepSession',
            this.getOriginsForMetric(
              'SleepSession',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const floorsClimbedResult =
      metricActiveStateMap['FloorsClimbed'] === true
        ? await this.getValue(
            new Date(date),
            'FloorsClimbed',
            this.getOriginsForMetric(
              'FloorsClimbed',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const basalMetabolicRateResult =
      metricActiveStateMap['BasalMetabolicRate'] === true
        ? await this.getValue(
            new Date(date),
            'BasalMetabolicRate',
            this.getOriginsForMetric(
              'BasalMetabolicRate',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const activeCaloriesResult =
      metricActiveStateMap['ActiveCaloriesBurned'] === true
        ? await this.getValue(
            new Date(date),
            'ActiveCaloriesBurned',
            this.getOriginsForMetric(
              'ActiveCaloriesBurned',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const totalCaloriesResult =
      metricActiveStateMap['TotalCaloriesBurned'] === true
        ? await this.getValue(
            new Date(date),
            'TotalCaloriesBurned',
            this.getOriginsForMetric(
              'TotalCaloriesBurned',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const weightResult =
      metricActiveStateMap['Weight'] === true
        ? await this.getValue(
            new Date(date),
            'Weight',
            this.getOriginsForMetric(
              'Weight',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const stepsResult =
      metricActiveStateMap['Steps'] === true
        ? await this.getValue(
            new Date(date),
            'Steps',
            this.getOriginsForMetric(
              'Steps',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const hydrationResult =
      metricActiveStateMap['Hydration'] === true
        ? await this.getValue(
            new Date(date),
            'Hydration',
            this.getOriginsForMetric(
              'Hydration',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const bloodPressureResult =
      metricActiveStateMap['BloodPressure'] === true
        ? await this.getValue(
            new Date(date),
            'BloodPressure',
            this.getOriginsForMetric(
              'BloodPressure',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const wheelchairPushesResult =
      metricActiveStateMap['WheelchairPushes'] === true
        ? await this.getValue(
            new Date(date),
            'WheelchairPushes',
            this.getOriginsForMetric(
              'WheelchairPushes',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const heightResult = metricActiveStateMap['Height']
      ? await this.getValue(
          new Date(date),
          'Height',
          this.getOriginsForMetric(
            'Height',
            originMappingMap,
            metricMappingMap,
          ),
        )
      : null;

    return {
      source: 'HealthConnectSyncClient',
      endTime: utils.getEndOfDay(new Date(date)).toISOString(),
      startTime: utils.getStartOfDay(new Date(date)).toISOString(),
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
          new Date(date),
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
    date: Date,
    record: RecordResult<'ExerciseSession'>,
    originMappingMap: HealthConnectOriginMappingMap,
    metricMappingMap: HealthConnectMetricMappingMap,
    metricActiveStateMap: HealthConnectMetricActiveStateMap,
    originNamesAsString: string,
  ): Promise<HealthConnectTrainingDataRecordData | null> {
    if (!originMappingMap) {
      return null;
    }

    const distanceResult =
      metricActiveStateMap['Distance'] === true
        ? await this.getValue(
            date,
            'Distance',
            this.getOriginsForMetric(
              'Distance',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

    const stepsResult =
      metricActiveStateMap['Steps'] === true
        ? await this.getValue(
            date,
            'Steps',
            this.getOriginsForMetric(
              'Steps',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const activeCaloriesBurnedResult =
      metricActiveStateMap['ActiveCaloriesBurned'] === true
        ? await this.getValue(
            date,
            'ActiveCaloriesBurned',
            this.getOriginsForMetric(
              'ActiveCaloriesBurned',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const heartRateResult =
      metricActiveStateMap['HeartRate'] === true
        ? await this.getValue(
            date,
            'HeartRate',
            this.getOriginsForMetric(
              'HeartRate',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const speedResult =
      metricActiveStateMap['Speed'] === true
        ? await this.getValue(
            date,
            'Speed',
            this.getOriginsForMetric(
              'Speed',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const elevationResult =
      metricActiveStateMap['ElevationGained'] === true
        ? await this.getValue(
            date,
            'ElevationGained',
            this.getOriginsForMetric(
              'ElevationGained',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const powerResult =
      metricActiveStateMap['Power'] === true
        ? await this.getValue(
            date,
            'Power',
            this.getOriginsForMetric(
              'Power',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const cyclingPedalingCadenceResult =
      metricActiveStateMap['CyclingPedalingCadence'] === true
        ? await this.getValue(
            date,
            'CyclingPedalingCadence',
            this.getOriginsForMetric(
              'CyclingPedalingCadence',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const hydrationResult =
      metricActiveStateMap['Hydration'] === true
        ? await this.getValue(
            date,
            'Hydration',
            this.getOriginsForMetric(
              'Hydration',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const restingHeartRateResult =
      metricActiveStateMap['RestingHeartRate'] === true
        ? await this.getValue(
            date,
            'RestingHeartRate',
            this.getOriginsForMetric(
              'RestingHeartRate',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const stepsCadenceResult =
      metricActiveStateMap['StepsCadence'] === true
        ? await this.getValue(
            date,
            'StepsCadence',
            this.getOriginsForMetric(
              'StepsCadence',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;
    const weightResult =
      metricActiveStateMap['Weight'] === true
        ? await this.getValue(
            date,
            'Weight',
            this.getOriginsForMetric(
              'Weight',
              originMappingMap,
              metricMappingMap,
            ),
          )
        : null;

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
    date: Date,
    record: TMetricResult,
    origens: string[],
  ): Promise<AggregateResult<TMetricResult>> {
    return await healthConnectService.getAggregateResult<TMetricResult>(
      record,
      {
        startTime: utils.getStartOfDay(date),
        endTime: utils.getEndOfDay(date),
      },
      origens,
    );
  }

  private getOriginsForMetric(
    key: AggregateResultRecordType,
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
