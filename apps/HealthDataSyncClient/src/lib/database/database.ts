import { open } from '@op-engineering/op-sqlite';
import {
  ApiAuthenticationTableEntry,
  HealthConnectMappingType,
  MappingTableEntry,
  ScheduleExecutionStatus,
  ScheduleFrequency,
  ScheduleSettingsTableEntry,
  scheduleSettingsTypes,
  ScheduleSettingsType,
} from './databaseTypes';
import { migrateDatabase } from './databaseMigration';

const databaseName = 'healthdata.db';

export const database = open({
  name: databaseName,
});

const mapMappingEntryRow = (
  row: Record<string, unknown>,
): MappingTableEntry => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  type: row.type as HealthConnectMappingType,
  isActive: Boolean(row.is_active),
  source: String(row.source),
  target: String(row.target),
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
  created_at: row.created_at ? String(row.created_at) : null,
  updated_at: row.updated_at ? String(row.updated_at) : null,
});

const createDefaultSchedule = (
  userId: number,
  type: ScheduleSettingsType,
): ScheduleSettingsTableEntry => ({
  id: 0,
  userId,
  type,
  isActive: false,
  hour: 0,
  minute: 0,
  frequency: 'daily',
  dayOfWeek: 0,
  lastExecutedAt: null,
  lastExecutionStatus: 'idle',
  lastExecutionError: null,
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
        `INSERT INTO api_authentication (user_id, access_token, refresh_token, token_expiration, app_key)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           access_token = excluded.access_token,
           refresh_token = excluded.refresh_token,
           token_expiration = excluded.token_expiration,
           app_key = excluded.app_key`,
        [
          authentication.userId,
          authentication.accessToken,
          authentication.refreshToken,
          authentication.tokenExpiration,
          authentication.appKey,
        ],
      );

      const persistedAuthentication =
        await databaseAccessor.authentication.getAuthentication(
          authentication.userId,
        );

      if (!persistedAuthentication) {
        throw new Error(`Failed to persist authentication.`);
      }

      return persistedAuthentication;
    },
  },
  schedule: {
    ensureSchedules: async (userId: number): Promise<void> => {
      await Promise.all(
        scheduleSettingsTypes.map(type =>
          databaseAccessor.schedule.saveSchedule(createDefaultSchedule(userId, type)),
        ),
      );
    },
    getSchedules: async (userId: number): Promise<ScheduleSettingsTableEntry[]> => {
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
        throw new Error(`Failed to persist schedule '${schedule.type}'.`);
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
      const schedule = await databaseAccessor.schedule.getSchedule(userId, type);

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
  mappingTable: {
    getMappingEntries: async (
      userId: number,
      type: HealthConnectMappingType,
    ): Promise<MappingTableEntry[]> => {
      const result = await database.execute(
        'SELECT id, user_id, type, is_active, source, target FROM mapping_entries WHERE user_id = ? AND type = ?',
        [userId, type],
      );

      return result.rows.map(mapMappingEntryRow);
    },
    addMappingEntries: async (
      userId: number,
      entries: MappingTableEntry[],
    ): Promise<MappingTableEntry[]> => {
      if (entries.length === 0) {
        return [];
      }

      const insertPromises = entries.map(entry =>
        database.execute(
          `INSERT INTO mapping_entries (user_id, type, is_active, source, target)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(user_id, type, source) DO UPDATE SET
             is_active = excluded.is_active,
             target = excluded.target`,
          [
            userId,
            entry.type,
            entry.isActive ? 1 : 0,
            entry.source,
            entry.target,
          ],
        ),
      );
      await Promise.all(insertPromises);
      return databaseAccessor.mappingTable.getMappingEntries(
        userId,
        entries[0].type,
      );
    },
    updateMappingEntry: async (
      userId: number,
      id: number,
      mappingUpdate: MappingTableEntry,
    ): Promise<MappingTableEntry[]> => {
      const updatedPromise = await database.execute(
        'UPDATE mapping_entries SET type = ?, is_active = ?, source = ?, target = ? WHERE id = ? AND user_id = ?',
        [
          mappingUpdate.type,
          mappingUpdate.isActive ? 1 : 0,
          mappingUpdate.source,
          mappingUpdate.target,
          id,
          userId,
        ],
      );

      await Promise.all([updatedPromise]);

      return databaseAccessor.mappingTable.getMappingEntries(
        userId,
        mappingUpdate.type,
      );
    },
    updateMappingEntries: async (
      userId: number,
      entries: MappingTableEntry[],
      type: HealthConnectMappingType,
    ): Promise<MappingTableEntry[]> => {
      const updatePromises = entries.map(entry =>
        database.execute(
          'UPDATE mapping_entries SET type = ?, is_active = ?, source = ?, target = ? WHERE id = ? AND user_id = ?',
          [
            entry.type,
            entry.isActive ? 1 : 0,
            entry.source,
            entry.target,
            entry.id,
            userId,
          ],
        ),
      );
      await Promise.all(updatePromises);

      return databaseAccessor.mappingTable.getMappingEntries(userId, type);
    },
    deleteMappingEntry: async (
      userId: number,
      id: number,
      type: HealthConnectMappingType,
    ): Promise<MappingTableEntry[]> => {
      await database.execute('DELETE FROM mapping_entries WHERE id = ? AND user_id = ?', [
        id,
        userId,
      ]);
      return databaseAccessor.mappingTable.getMappingEntries(userId, type);
    },
  },
};
export default database;
