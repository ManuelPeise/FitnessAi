import { RecordType } from 'react-native-health-connect';
import { databaseAccessor } from '../../database/database';
import {
  HealthConnectMappingType,
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { healthConnectService } from '../healthConnect/healthConnectService';
import {
  HealthConnectDataExport,
  HealthConnectDataExportModel,
  HealthConnectExportRequest,
  HealthConnectMappingMap,
  HealthConnectScheduleData,
} from './scheduleTypes';
import { mapMetric } from './metricMapper';
import { getResource } from '../../localization';

class HealthConnectSchedulePayloadFactory {
  private readonly databaseService = databaseAccessor;
  private readonly healthConnect = healthConnectService;

  create = async (
    userId: number,
    request: HealthConnectExportRequest,
  ): Promise<HealthConnectDataExportModel> => {
    try {
      if (request.type !== 'HealthConnectHealthDataExport') {
        throw new Error(
          `${getResource(
            'healthConnect.descriptionUnsupportedExportRequestTypePrefix',
          )}: ${request.type}`,
        );
      }

      return await this.getHealthMetricExportPayload(userId, request);
    } catch (error) {
      console.error(
        `${getResource(
          'healthConnect.descriptionPayloadFactoryFailedPrefix',
        )} "${userId}" and type "${request.type}".`,
        error,
      );
      return { trainingData: [], healthData: [], schedule: null };
    }
  };

  private getHealthMetricExportPayload = async (
    userId: number,
    request: HealthConnectExportRequest,
  ): Promise<HealthConnectDataExportModel> => {
    const scheduleData = await this.getHealthConnectScheduleData(
      userId,
      request.type,
    );

    if (!scheduleData) {
      return { trainingData: [], healthData: [], schedule: null };
    }

    const { originMappings, metricMappings, schedule } = scheduleData;

    if (!originMappings || !metricMappings) {
      return { trainingData: [], healthData: [], schedule: schedule };
    }

    const trainingData = await this.getHealthConnectExerciseExportPayload(
      request,
      originMappings,
      metricMappings,
    );

    const healthData = await this.getHealthDataExportPayload(
      request,
      originMappings,
      metricMappings,
    );

    return { trainingData, healthData, schedule: schedule };
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

  private getActiveMappings = async (
    userId: number,
    type: HealthConnectMappingType,
  ): Promise<HealthConnectMappingMap> => {
    const mappings = await this.databaseService.mappingTable.getMappingEntries(
      userId,
      type,
    );

    const mappingMap: HealthConnectMappingMap = {};

    mappings.forEach(mapping => {
      if (mapping.isActive && mapping.target) {
        mappingMap[mapping.source] = mapping;
      }
    });

    return mappingMap;
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
      originMappings: await this.getActiveMappings(
        userId,
        'HealthConnectOrigin',
      ),
      metricMappings: await this.getActiveMappings(
        userId,
        'HealthConnectMetric',
      ),
      schedule,
    };

    return scheduleData;
  };

  private getHealthConnectExerciseExportPayload = async (
    request: HealthConnectExportRequest,
    originMappings: HealthConnectMappingMap,
    metricMappings: HealthConnectMappingMap,
  ): Promise<HealthConnectDataExport[]> => {
    const payload: HealthConnectDataExport[] = [];
    const activeOriginMappings = Object.values(originMappings).filter(
      mapping => mapping?.target && mapping.isActive,
    );
    const activeMetricMappings = Object.values(metricMappings).filter(
      mapping =>
        mapping?.isActive &&
        ('ExerciseSession' as RecordType) !== mapping.source,
    );
    const exerciseRecords = await this.healthConnect.readMetric(
      'ExerciseSession',
      {
        startTime: request.from,
        endTime: request.to,
      },
    );

    for (const originMapping of activeOriginMappings) {
      const exercises = exerciseRecords.records.filter(
        record => record.metadata?.dataOrigin == originMapping.source,
      );

      for (const exercise of exercises) {
        const dataSet: HealthConnectDataExport = {
          metadata: {
            from: request.from,
            to: request.to,
            type: 'HealthConnectHealthDataExport',
            origin: originMapping.target,
          },
          data: [],
        };

        const exerciseId = exercise.metadata?.id ?? null;
        const mappedExercise = mapMetric(
          'ExerciseSession' as RecordType,
          { records: [exercise] },
          exerciseId,
        );

        dataSet.data.push(...mappedExercise);

        const exerciseMetaData = {
          from: exercise.startTime,
          to: exercise.endTime,
        };

        const metricData = await Promise.all(
          activeMetricMappings.map(async mapping => {
            const recordData = await this.healthConnect.readMetric(
              mapping.source as RecordType,
              {
                startTime: exerciseMetaData.from,
                endTime: exerciseMetaData.to,
              },
            );

            return mapMetric(
              mapping.source as RecordType,
              {
                records: recordData.records.filter(
                  record => record.metadata?.dataOrigin == originMapping.source,
                ),
              },
              exerciseId,
            );
          }),
        );

        metricData.forEach(mappedData => dataSet.data.push(...mappedData));
        payload.push(dataSet);
      }
    }

    return payload;
  };

  private getHealthDataExportPayload = async (
    request: HealthConnectExportRequest,
    originMappings: HealthConnectMappingMap,
    metricMappings: HealthConnectMappingMap,
  ): Promise<HealthConnectDataExport[]> => {
    const payload: HealthConnectDataExport[] = [];

    for (
      let origin = 0;
      origin < Object.keys(originMappings).length;
      origin++
    ) {
      const originMapping = originMappings[Object.keys(originMappings)[origin]];

      if (!originMapping || !originMapping.target || !originMapping.isActive) {
        continue;
      }

      const dataSet: HealthConnectDataExport = {
        metadata: {
          from: request.from,
          to: request.to,
          type: 'HealthConnectHealthDataExport',
          origin: originMapping.target,
        },
        data: [],
      };

      for (
        let metric = 0;
        metric < Object.keys(metricMappings).length;
        metric++
      ) {
        const mapping = metricMappings[Object.keys(metricMappings)[metric]];

        if (
          !mapping ||
          !mapping.isActive ||
          ('ExerciseSession' as RecordType) === mapping.source
        ) {
          continue;
        }
        const recordData = await this.healthConnect.readMetric(
          mapping.source as RecordType,
          {
            startTime: request.from,
            endTime: request.to,
          },
        );

        if (recordData.records.length > 0) {
          const records = {
            records: recordData.records.filter(
              record => record.metadata?.dataOrigin == originMapping.source,
            ),
          };

          const mappedData = mapMetric(
            mapping.source as RecordType,
            records,
            null,
          );

          if (mappedData.length > 0) {
            dataSet.data.push(...mappedData);
          }
        }
      }

      if (dataSet.data.length > 0) {
        payload.push(dataSet);
      }
    }

    return payload;
  };
}

export const healthConnectSchedulePayloadFactory =
  new HealthConnectSchedulePayloadFactory();
