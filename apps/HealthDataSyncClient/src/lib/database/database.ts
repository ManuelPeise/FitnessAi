import { open } from '@op-engineering/op-sqlite';
import {
  ApiAuthenticationTableEntry,
  HealthConnectMetricMappingTableEntry,
  HealthConnectOriginMappingTableEntry,
  ScheduleExecutionStatus,
  ScheduleFrequency,
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from './databaseTypes';
import { migrateDatabase } from './databaseMigration';
import { getResource } from '../localization';

const databaseName = 'healthdata.db';

export const database = open({
  name: databaseName,
});

const mapMetricMappingRow = (
  row: Record<string, unknown>,
): HealthConnectMetricMappingTableEntry => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  isActive: Boolean(row.is_active),
  source: String(row.source),
  target: String(row.target),
});

const mapOriginMappingRow = (
  row: Record<string, unknown>,
): HealthConnectOriginMappingTableEntry => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  isActive: Boolean(row.is_active),
  source: String(row.source),
  target: String(row.target),
  metricIds: JSON.parse(String(row.metric_ids ?? '[]')) as number[],
});

const mapScheduleRow = (
  row: Record<string, unknown>,
): ScheduleSettingsTableEntry => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  type: row.type as ScheduleSettingsType,
  isActive: Boolean(row.is_active),
  hour: Number(row.hour),
  minute: Number(row.minute),
  frequency: row.frequency as ScheduleFrequency,
  dayOfWeek: Number(row.day_of_week),
  lastExecutedAt: row.last_executed_at ? String(row.last_executed_at) : null,
  lastExecutionStatus: (row.last_execution_status ??
    'idle') as ScheduleExecutionStatus,
  lastExecutionError: row.last_execution_error
    ? String(row.last_execution_error)
    : null,
});

const mapAuthenticationRow = (
  row: Record<string, unknown>,
): ApiAuthenticationTableEntry => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  accessToken: row.access_token ? String(row.access_token) : null,
  refreshToken: row.refresh_token ? String(row.refresh_token) : null,
  tokenExpiration: row.token_expiration ? String(row.token_expiration) : null,
  appKey: row.app_key ? String(row.app_key) : null,
  selectedLanguage: row.selected_language
    ? (String(row.selected_language) as 'en' | 'de')
    : null,
  created_at: row.created_at ? String(row.created_at) : null,
  updated_at: row.updated_at ? String(row.updated_at) : null,
});

export const databaseAccessor = {
  initializeDatabase: async (): Promise<void> => {
    await migrateDatabase();
  },
  authentication: {
    getAuthentication: async (
      userId: number,
    ): Promise<ApiAuthenticationTableEntry | null> => {
      const result = await database.execute(
        'SELECT * FROM api_authentication WHERE user_id = ?',
        [userId],
      );

      return result.rows.length > 0
        ? mapAuthenticationRow(result.rows[0])
        : null;
    },
    saveAuthentication: async (
      authentication: ApiAuthenticationTableEntry,
    ): Promise<ApiAuthenticationTableEntry> => {
      await database.execute(
        `INSERT INTO api_authentication (user_id, access_token, refresh_token, token_expiration, app_key, selected_language)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           access_token = excluded.access_token,
           refresh_token = excluded.refresh_token,
           token_expiration = excluded.token_expiration,
           app_key = excluded.app_key,
           selected_language = excluded.selected_language`,
        [
          authentication.userId,
          authentication.accessToken,
          authentication.refreshToken,
          authentication.tokenExpiration,
          authentication.appKey,
          authentication.selectedLanguage,
        ],
      );

      const persistedAuthentication =
        await databaseAccessor.authentication.getAuthentication(
          authentication.userId,
        );

      if (!persistedAuthentication) {
        throw new Error(
          getResource('common.descriptionPersistAuthenticationFailed'),
        );
      }

      return persistedAuthentication;
    },
  },
  schedule: {
    getSchedules: async (
      userId: number,
    ): Promise<ScheduleSettingsTableEntry[]> => {
      const result = await database.execute(
        'SELECT * FROM schedule_settings WHERE user_id = ?',
        [userId],
      );

      return result.rows.map(mapScheduleRow);
    },
    getSchedule: async (
      userId: number,
      type: ScheduleSettingsType,
    ): Promise<ScheduleSettingsTableEntry | null> => {
      const result = await database.execute(
        'SELECT * FROM schedule_settings WHERE user_id = ? AND type = ?',
        [userId, type],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapScheduleRow(result.rows[0]);
    },
    saveSchedule: async (
      schedule: ScheduleSettingsTableEntry,
    ): Promise<ScheduleSettingsTableEntry> => {
      await database.execute(
        `INSERT INTO schedule_settings (user_id, type, is_active, hour, minute, frequency, day_of_week, last_executed_at, last_execution_status, last_execution_error)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, type) DO UPDATE SET
           is_active = excluded.is_active,
           hour = excluded.hour,
           minute = excluded.minute,
           frequency = excluded.frequency,
           day_of_week = excluded.day_of_week,
           last_executed_at = excluded.last_executed_at,
           last_execution_status = excluded.last_execution_status,
           last_execution_error = excluded.last_execution_error`,
        [
          schedule.userId,
          schedule.type,
          schedule.isActive ? 1 : 0,
          schedule.hour,
          schedule.minute,
          schedule.frequency,
          schedule.dayOfWeek,
          schedule.lastExecutedAt,
          schedule.lastExecutionStatus,
          schedule.lastExecutionError,
        ],
      );

      const persistedSchedule = await databaseAccessor.schedule.getSchedule(
        schedule.userId,
        schedule.type,
      );

      if (!persistedSchedule) {
        throw new Error(
          `${getResource('common.descriptionPersistScheduleFailedPrefix')} '${
            schedule.type
          }'.`,
        );
      }

      return persistedSchedule;
    },
    setExecutionState: async (
      userId: number,
      type: ScheduleSettingsType,
      status: ScheduleExecutionStatus,
      options?: {
        lastExecutedAt?: string | null;
        lastExecutionError?: string | null;
      },
    ): Promise<ScheduleSettingsTableEntry | null> => {
      const schedule = await databaseAccessor.schedule.getSchedule(
        userId,
        type,
      );

      if (schedule == null) {
        return null;
      }

      const nextSchedule: ScheduleSettingsTableEntry = {
        ...schedule,
        lastExecutionStatus: status,
        lastExecutedAt:
          options && 'lastExecutedAt' in options
            ? options.lastExecutedAt ?? null
            : schedule.lastExecutedAt,
        lastExecutionError:
          options && 'lastExecutionError' in options
            ? options.lastExecutionError ?? null
            : schedule.lastExecutionError,
      };

      return databaseAccessor.schedule.saveSchedule(nextSchedule);
    },
  },
  originMappingTable: {
    getMappingEntries: async (
      userId: number,
    ): Promise<HealthConnectOriginMappingTableEntry[]> => {
      const result = await database.execute(
        `SELECT id, user_id, is_active, source, target, metric_ids FROM health_connect_origin_mappings WHERE user_id = ?`,
        [userId],
      );

      return result.rows.map(mapOriginMappingRow);
    },
    addMappingEntries: async (
      userId: number,
      entries: HealthConnectOriginMappingTableEntry[],
    ): Promise<HealthConnectOriginMappingTableEntry[]> => {
      await Promise.all(
        entries.map(entry =>
          database.execute(
            `INSERT INTO health_connect_origin_mappings
              (user_id, is_active, source, target, metric_ids)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(user_id, source) DO UPDATE SET
              is_active = excluded.is_active,
              target = excluded.target,
              metric_ids = excluded.metric_ids`,
            [
              userId,
              entry.isActive ? 1 : 0,
              entry.source,
              entry.target,
              JSON.stringify(entry.metricIds),
            ],
          ),
        ),
      );
      return databaseAccessor.originMappingTable.getMappingEntries(userId);
    },
    updateMappingEntry: async (
      userId: number,
      id: number,
      entry: HealthConnectOriginMappingTableEntry,
    ): Promise<HealthConnectOriginMappingTableEntry[]> => {
      await database.execute(
        `UPDATE health_connect_origin_mappings
         SET is_active = ?, source = ?, target = ?, metric_ids = ?
         WHERE id = ? AND user_id = ?`,
        [
          entry.isActive ? 1 : 0,
          entry.source,
          entry.target,
          JSON.stringify(entry.metricIds),
          id,
          userId,
        ],
      );
      return databaseAccessor.originMappingTable.getMappingEntries(userId);
    },
  },
  metricMappingTable: {
    getMappingEntries: async (
      userId: number,
    ): Promise<HealthConnectMetricMappingTableEntry[]> => {
      const result = await database.execute(
        `SELECT id, user_id, is_active, source, target FROM health_connect_metric_mappings WHERE user_id = ?`,
        [userId],
      );

      return result.rows.map(mapMetricMappingRow);
    },
    addMappingEntries: async (
      userId: number,
      entries: HealthConnectMetricMappingTableEntry[],
    ): Promise<HealthConnectMetricMappingTableEntry[]> => {
      await Promise.all(
        entries.map(entry =>
          database.execute(
            `INSERT INTO health_connect_metric_mappings
              (user_id, is_active, source, target)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(user_id, source) DO UPDATE SET
              is_active = excluded.is_active,
              target = excluded.target`,
            [userId, entry.isActive ? 1 : 0, entry.source, entry.target],
          ),
        ),
      );
      return databaseAccessor.metricMappingTable.getMappingEntries(userId);
    },
    updateMappingEntry: async (
      userId: number,
      id: number,
      entry: HealthConnectMetricMappingTableEntry,
    ): Promise<HealthConnectMetricMappingTableEntry[]> => {
      await database.execute(
        `UPDATE health_connect_metric_mappings
         SET is_active = ?, source = ?, target = ?
         WHERE id = ? AND user_id = ?`,
        [entry.isActive ? 1 : 0, entry.source, entry.target, id, userId],
      );
      return databaseAccessor.metricMappingTable.getMappingEntries(userId);
    },
  },
};
export default database;
