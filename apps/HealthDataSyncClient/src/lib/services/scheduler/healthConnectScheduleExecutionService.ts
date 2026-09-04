import type { RecordResult, RecordType } from 'react-native-health-connect';
import {
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { databaseAccessor } from '../../database/database';
import { apiClient } from '../api/axiosClient';
import { healthConnectService } from '../healthConnect/healthConnectService';
import { healthConnectMetricMapper } from '../healthConnect/healthConnectMetricMapper';

type ScheduleRunTrigger = 'manual' | 'background';

type ScheduleExecutionReason =
  | 'completed'
  | 'inactive'
  | 'not-due'
  | 'not-implemented'
  | 'missing-last-execution'
  | 'permission-denied'
  | 'no-active-origins'
  | 'no-active-metrics'
  | 'no-mapped-data'
  | 'request-failed'
  | 'schedule-not-found';

export type ScheduleExecutionResult = {
  scheduleType: ScheduleSettingsType;
  trigger: ScheduleRunTrigger;
  success: boolean;
  pushedItems: number;
  reason: ScheduleExecutionReason;
  message?: string;
};

type ActiveMapping = {
  source: string;
  target: string;
};

type ScheduleSyncPayloadItem = {
  scheduleType: ScheduleSettingsType;
  mappedOrigin: string;
  sourceOrigin: string;
  mappedMetric: string;
  sourceMetric: string;
  sourceMetricName: string;
  value: number;
  unit: string;
  startTimeUtc: string;
  endTimeUtc: string;
};

type ScheduleSyncPayload = {
  scheduleType: ScheduleSettingsType;
  windowStartUtc: string;
  windowEndUtc: string;
  generatedAtUtc: string;
  items: ScheduleSyncPayloadItem[];
};

const scheduleSyncServiceUrl = 'HealthConnectImport/ImportTrainingData';
const supportedScheduleType: ScheduleSettingsType =
  'HealthConnectExerciseDataExport';

const minimumInitialLoadDays = 1;
const maximumInitialLoadDays = 365;

const minutesPerHour = 60;
const millisecondsPerMinute = 60_000;
const millisecondsPerHour = minutesPerHour * millisecondsPerMinute;

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unknown schedule execution error.';
};

const createDateWithTime = (base: Date, hour: number, minute: number): Date => {
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const getMostRecentPlannedRun = (
  schedule: ScheduleSettingsTableEntry,
  now: Date,
): Date => {
  if (schedule.frequency === 'hourly') {
    const run = new Date(now);
    run.setSeconds(0, 0);
    run.setMinutes(schedule.minute);

    if (run > now) {
      run.setHours(run.getHours() - 1);
    }

    return run;
  }

  if (schedule.frequency === 'daily') {
    const run = createDateWithTime(now, schedule.hour, schedule.minute);

    if (run > now) {
      run.setDate(run.getDate() - 1);
    }

    return run;
  }

  const run = createDateWithTime(now, schedule.hour, schedule.minute);
  const dayOffset = (run.getDay() - schedule.dayOfWeek + 7) % 7;
  run.setDate(run.getDate() - dayOffset);

  if (run > now) {
    run.setDate(run.getDate() - 7);
  }

  return run;
};

const isScheduleDue = (
  schedule: ScheduleSettingsTableEntry,
  now: Date,
): boolean => {
  const plannedRun = getMostRecentPlannedRun(schedule, now);

  if (schedule.lastExecutedAt == null) {
    return now >= plannedRun;
  }

  const lastExecutedAt = new Date(schedule.lastExecutedAt);

  if (Number.isNaN(lastExecutedAt.getTime())) {
    return true;
  }

  return lastExecutedAt < plannedRun;
};

const getWindowStart = (
  schedule: ScheduleSettingsTableEntry,
  now: Date,
  initialLoadDays?: number,
): Date | null => {
  if (typeof schedule.lastExecutedAt === 'string') {
    const parsed = new Date(schedule.lastExecutedAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof initialLoadDays === 'number') {
    const safeDays = Math.max(
      minimumInitialLoadDays,
      Math.min(maximumInitialLoadDays, Math.floor(initialLoadDays)),
    );

    return new Date(now.getTime() - safeDays * 24 * millisecondsPerHour);
  }

  return null;
};

const mapActiveMappings = (mappings: ActiveMapping[]): Map<string, string> => {
  const result = new Map<string, string>();

  mappings.forEach(mapping => {
    const source = mapping.source.trim();
    const target = mapping.target.trim();

    if (source.length > 0 && target.length > 0) {
      result.set(source, target);
    }
  });

  return result;
};

const mapRecordPayload = (
  scheduleType: ScheduleSettingsType,
  sourceMetric: string,
  mappedMetric: string,
  sourceOrigin: string,
  mappedOrigin: string,
  record: RecordResult<RecordType>,
): ScheduleSyncPayloadItem[] => {
  const mappedItems = healthConnectMetricMapper.mapRecord(
    sourceMetric as RecordType,
    record,
  );

  return mappedItems.map(item => ({
    scheduleType,
    mappedOrigin,
    sourceOrigin,
    mappedMetric,
    sourceMetric,
    sourceMetricName: item.metricName,
    value: item.value,
    unit: item.unit,
    startTimeUtc: item.startTime.toISOString(),
    endTimeUtc: item.endTime.toISOString(),
  }));
};

const loadSchedule = async (
  scheduleType: ScheduleSettingsType,
): Promise<ScheduleSettingsTableEntry | null> => {
  await databaseAccessor.schedule.ensureSchedules();
  return databaseAccessor.schedule.getSchedule(scheduleType);
};

const executeSchedule = async (
  schedule: ScheduleSettingsTableEntry,
  trigger: ScheduleRunTrigger,
  forceRun: boolean,
  initialLoadDays?: number,
): Promise<ScheduleExecutionResult> => {
  const now = new Date();

  if (schedule.type !== supportedScheduleType) {
    await databaseAccessor.schedule.setExecutionState(schedule.type, 'skipped', {
      lastExecutionError:
        'This schedule type is not implemented yet on the backend.',
    });

    return {
      scheduleType: schedule.type,
      trigger,
      success: true,
      pushedItems: 0,
      reason: 'not-implemented',
      message: 'This schedule type is not implemented yet on the backend.',
    };
  }

  if (!schedule.isActive) {
    await databaseAccessor.schedule.setExecutionState(
      schedule.type,
      'skipped',
      { lastExecutionError: 'Schedule is inactive.' },
    );

    return {
      scheduleType: schedule.type,
      trigger,
      success: true,
      pushedItems: 0,
      reason: 'inactive',
      message: 'Schedule is inactive.',
    };
  }

  if (!forceRun && !isScheduleDue(schedule, now)) {
    return {
      scheduleType: schedule.type,
      trigger,
      success: true,
      pushedItems: 0,
      reason: 'not-due',
    };
  }

  await databaseAccessor.schedule.setExecutionState(schedule.type, 'running', {
    lastExecutionError: null,
  });

  try {
    const permissionsGranted = await healthConnectService.ensurePermissions();

    if (!permissionsGranted) {
      const reason = 'Health Connect permissions were not granted.';
      await databaseAccessor.schedule.setExecutionState(
        schedule.type,
        'failed',
        {
          lastExecutionError: reason,
        },
      );

      return {
        scheduleType: schedule.type,
        trigger,
        success: false,
        pushedItems: 0,
        reason: 'permission-denied',
        message: reason,
      };
    }

    const [originMappings, metricMappings] = await Promise.all([
      databaseAccessor.mappingTable.getMappingEntries('HealthConnectOrigin'),
      databaseAccessor.mappingTable.getMappingEntries('HealthConnectMetric'),
    ]);

    const activeOrigins = mapActiveMappings(
      originMappings
        .filter(mapping => mapping.isActive)
        .map(mapping => ({ source: mapping.source, target: mapping.target })),
    );

    const activeMetrics = metricMappings
      .filter(mapping => mapping.isActive)
      .map(mapping => ({ source: mapping.source, target: mapping.target }))
      .filter(mapping => mapping.source.trim().length > 0)
      .filter(mapping => mapping.target.trim().length > 0);

    if (activeOrigins.size === 0) {
      await databaseAccessor.schedule.setExecutionState(
        schedule.type,
        'skipped',
        {
          lastExecutionError: 'No active origin mappings configured.',
        },
      );

      return {
        scheduleType: schedule.type,
        trigger,
        success: true,
        pushedItems: 0,
        reason: 'no-active-origins',
      };
    }

    if (activeMetrics.length === 0) {
      await databaseAccessor.schedule.setExecutionState(
        schedule.type,
        'skipped',
        {
          lastExecutionError: 'No active metric mappings configured.',
        },
      );

      return {
        scheduleType: schedule.type,
        trigger,
        success: true,
        pushedItems: 0,
        reason: 'no-active-metrics',
      };
    }

    const windowStart = getWindowStart(schedule, now, initialLoadDays);
    const windowEnd = now;

    if (windowStart == null) {
      const reason =
        'No previous execution found. Use Initial load to define the first export window.';

      await databaseAccessor.schedule.setExecutionState(schedule.type, 'skipped', {
        lastExecutionError: reason,
      });

      return {
        scheduleType: schedule.type,
        trigger,
        success: false,
        pushedItems: 0,
        reason: 'missing-last-execution',
        message: reason,
      };
    }

    const payloadItems: ScheduleSyncPayloadItem[] = [];

    for (const metricMapping of activeMetrics) {
      let records: Awaited<
        ReturnType<typeof healthConnectService.readMetric>
      > | null = null;
      try {
        records = await healthConnectService.readMetric(
          metricMapping.source as RecordType,
          {
            startTime: windowStart,
            endTime: windowEnd,
          },
        );
      } catch (metricReadError) {
        console.error(
          `Failed to read Health Connect metric '${metricMapping.source}'.`,
          metricReadError,
        );
        continue;
      }

      if (records == null) {
        continue;
      }

      records.records.forEach(record => {
        const metadata = record as { metadata?: { dataOrigin?: string } };
        const sourceOrigin = metadata.metadata?.dataOrigin;

        if (!sourceOrigin) {
          return;
        }

        const mappedOrigin = activeOrigins.get(sourceOrigin);

        if (!mappedOrigin) {
          return;
        }

        const mapped = mapRecordPayload(
          schedule.type,
          metricMapping.source,
          metricMapping.target,
          sourceOrigin,
          mappedOrigin,
          record as RecordResult<RecordType>,
        );

        payloadItems.push(...mapped);
      });
    }

    if (payloadItems.length === 0) {
      await databaseAccessor.schedule.setExecutionState(
        schedule.type,
        'success',
        {
          lastExecutedAt: now.toISOString(),
          lastExecutionError: null,
        },
      );

      return {
        scheduleType: schedule.type,
        trigger,
        success: true,
        pushedItems: 0,
        reason: 'no-mapped-data',
      };
    }

    const payload: ScheduleSyncPayload = {
      scheduleType: schedule.type,
      windowStartUtc: windowStart.toISOString(),
      windowEndUtc: windowEnd.toISOString(),
      generatedAtUtc: now.toISOString(),
      items: payloadItems,
    };

    await apiClient.post(scheduleSyncServiceUrl, payload);

    await databaseAccessor.schedule.setExecutionState(
      schedule.type,
      'success',
      {
        lastExecutedAt: now.toISOString(),
        lastExecutionError: null,
      },
    );

    return {
      scheduleType: schedule.type,
      trigger,
      success: true,
      pushedItems: payloadItems.length,
      reason: 'completed',
    };
  } catch (error) {
    const message = toErrorMessage(error);
    await databaseAccessor.schedule.setExecutionState(schedule.type, 'failed', {
      lastExecutionError: message,
    });

    return {
      scheduleType: schedule.type,
      trigger,
      success: false,
      pushedItems: 0,
      reason: 'request-failed',
      message,
    };
  }
};

export const healthConnectScheduleExecutionService = {
  async executeManually(
    scheduleType: ScheduleSettingsType,
    options?: {
      initialLoadDays?: number;
    },
  ): Promise<ScheduleExecutionResult> {
    const schedule = await loadSchedule(scheduleType);

    if (schedule == null) {
      return {
        scheduleType,
        trigger: 'manual',
        success: false,
        pushedItems: 0,
        reason: 'schedule-not-found',
      };
    }

    return executeSchedule(schedule, 'manual', true, options?.initialLoadDays);
  },
  async executeDueSchedules(): Promise<ScheduleExecutionResult[]> {
    await databaseAccessor.schedule.ensureSchedules();
    const schedules = await databaseAccessor.schedule.getSchedules();
    const activeSchedules = schedules.filter(
      schedule => schedule.isActive && schedule.type === supportedScheduleType,
    );

    const results: ScheduleExecutionResult[] = [];

    for (const schedule of activeSchedules) {
      const result = await executeSchedule(schedule, 'background', false);
      results.push(result);
    }

    return results;
  },
};
