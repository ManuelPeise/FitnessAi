import { ReadRecordsResult, RecordType } from 'react-native-health-connect';
import { databaseAccessor } from '../../database/database';
import {
  HealthConnectMappingType,
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { healthConnectService } from '../healthConnect/healthConnectService';
import {
  excersiseRecordTypes,
  HealthConnectDataEntry,
  HealthConnectDataExport,
  HealthConnectDataExportModel,
  HealthConnectExportRequest,
  HealthConnectMappingMap,
  HealthConnectScheduleData,
} from './scheduleTypes';
import { mapMetric } from './metricMapper';

class HealthConnectSchedulePayloadFactory {
  private readonly databaseService = databaseAccessor;
  private readonly healthConnect = healthConnectService;

  create = async (
    userId: number,
    request: HealthConnectExportRequest,
  ): Promise<HealthConnectDataExportModel> => {
    try {
      switch (request.type) {
        case 'HealthConnectExerciseDataExport':
          return await this.getExerciseDataExportPayload(userId, request);
        case 'HealthConnectHealthDataExport':
          return await this.getHealthMetricExportPayload(userId, request);
        default:
          throw new Error(`Unsupported export request type: ${request.type}`);
      }
    } catch (error) {
      console.error(
        `[HealthConnectSchedulePayloadFactory] Failed to create export payload for userId "${userId}" and type "${request.type}".`,
        error,
      );
      return { payload: [], schedule: null };
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
      return { payload: [], schedule: null };
    }

    const { originMappings, metricMappings, schedule } = scheduleData;

    if (!originMappings || !metricMappings) {
      return { payload: [], schedule: schedule };
    }

    const requestPayload: HealthConnectDataExport[] =
      await this.getHealthDataExportPayload(
        request,
        originMappings,
        metricMappings,
      );

    return { payload: requestPayload, schedule: schedule };
  };

  private getExerciseDataExportPayload = async (
    userId: number,
    request: HealthConnectExportRequest,
  ): Promise<HealthConnectDataExportModel> => {
    const scheduleData = await this.getHealthConnectScheduleData(
      userId,
      request.type,
    );

    if (!scheduleData) {
      return { payload: [], schedule: null };
    }

    const { originMappings, metricMappings, schedule } = scheduleData;

    if (
      !originMappings ||
      !metricMappings ||
      !metricMappings['ExerciseSession']
    ) {
      return { payload: [], schedule: schedule };
    }

    const exerciseSessions = await this.healthConnect.readExerciseSessions({
      startTime: request.from,
      endTime: request.to,
    });

    const requestPayload = await this.getExerciseSessionPayload(
      request,
      exerciseSessions,
      originMappings,
    );

    return { payload: requestPayload, schedule: schedule };
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

  private getExersiseSessionMetrics = async (
    request: HealthConnectExportRequest,
  ): Promise<HealthConnectDataEntry[]> => {
    const metrics: HealthConnectDataEntry[] = [];

    excersiseRecordTypes.forEach(async recordType => {
      const metricsResult = await this.healthConnect.readMetric<
        typeof recordType
      >(recordType, {
        startTime: request.from,
        endTime: request.to,
      });

      const data = mapMetric(recordType, metricsResult);

      if (data.length > 0) {
        metrics.push(...data);
      }
    });

    return metrics;
  };

  private getExerciseSessionPayload = async (
    request: HealthConnectExportRequest,
    sessions: ReadRecordsResult<'ExerciseSession'>,
    originMappings: HealthConnectMappingMap,
  ): Promise<HealthConnectDataExport[]> => {
    const requestPayload: HealthConnectDataExport[] = [];

    for (let i = 0; i < sessions.records.length; i++) {
      const record = sessions.records[i];

      if (
        !record.metadata?.dataOrigin ||
        !originMappings[record.metadata.dataOrigin] ||
        !originMappings[record.metadata.dataOrigin]?.target
      ) {
        continue;
      }

      const model: HealthConnectDataExport = {
        metadata: {
          from: request.from,
          to: request.to,
          type: 'HealthConnectExerciseDataExport',
          origin: originMappings[record.metadata.dataOrigin].target,
        },
        data: await this.getExersiseSessionMetrics(request),
      };

      requestPayload.push(model);
    }

    return requestPayload;
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

      if (!originMapping || !originMapping.target) {
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

        const recordData = await this.healthConnect.readMetric(
          mapping.source as RecordType,
          {
            startTime: request.from,
            endTime: request.to,
          },
        );

        const mappedData = mapMetric(mapping.source as RecordType, recordData);

        if (mappedData.length > 0) {
          dataSet.data.push(...mappedData);
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
