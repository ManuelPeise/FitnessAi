import { open } from '@op-engineering/op-sqlite';
import {
  HealthConnectMappingType,
  MappingTableEntry,
  ScheduleFrequency,
  ScheduleSettingsTableEntry,
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
  type: row.type as HealthConnectMappingType,
  isActive: Boolean(row.is_active),
  source: String(row.source),
  target: String(row.target),
});

const mapScheduleRow = (
  row: Record<string, unknown>,
): ScheduleSettingsTableEntry => ({
  id: Number(row.id),
  type: row.type as ScheduleSettingsType,
  isActive: Boolean(row.is_active),
  hour: Number(row.hour),
  minute: Number(row.minute),
  frequency: row.frequency as ScheduleFrequency,
  dayOfWeek: Number(row.day_of_week),
  lastExecutedAt: row.last_executed_at ? String(row.last_executed_at) : null,
});

export const databaseAccessor = {
  initializeDatabase: async (): Promise<void> => {
    await migrateDatabase();
  },
  schedule: {
    getSchedule: async (
      type: ScheduleSettingsType,
    ): Promise<ScheduleSettingsTableEntry | null> => {
      const result = await database.execute(
        'SELECT * FROM schedule_settings WHERE type = ?',
        [type],
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
        `INSERT INTO schedule_settings (type, is_active, hour, minute, frequency, day_of_week, last_executed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(type) DO UPDATE SET
           is_active = excluded.is_active,
           hour = excluded.hour,
           minute = excluded.minute,
           frequency = excluded.frequency,
           day_of_week = excluded.day_of_week,
           last_executed_at = excluded.last_executed_at`,
        [
          schedule.type,
          schedule.isActive ? 1 : 0,
          schedule.hour,
          schedule.minute,
          schedule.frequency,
          schedule.dayOfWeek,
          schedule.lastExecutedAt,
        ],
      );

      const persistedSchedule = await databaseAccessor.schedule.getSchedule(
        schedule.type,
      );

      if (!persistedSchedule) {
        throw new Error(`Failed to persist schedule '${schedule.type}'.`);
      }

      return persistedSchedule;
    },
  },
  mappingTable: {
    getMappingEntries: async (
      type: HealthConnectMappingType,
    ): Promise<MappingTableEntry[]> => {
      const result = await database.execute(
        'SELECT id, type, is_active, source, target FROM mapping_entries WHERE type = ?',
        [type],
      );

      return result.rows.map(mapMappingEntryRow);
    },
    addMappingEntries: async (
      entries: MappingTableEntry[],
    ): Promise<MappingTableEntry[]> => {
      const insertPromises = entries.map(entry =>
        database.execute(
          'INSERT INTO mapping_entries (type, is_active, source, target) VALUES (?, ?, ?, ?)',
          [entry.type, entry.isActive ? 1 : 0, entry.source, entry.target],
        ),
      );
      await Promise.all(insertPromises);
      return databaseAccessor.mappingTable.getMappingEntries(entries[0].type);
    },
    updateMappingEntry: async (
      id: number,
      mappingUpdate: MappingTableEntry,
    ): Promise<MappingTableEntry[]> => {
      const updatedPromise = await database.execute(
        'UPDATE mapping_entries SET type = ?, is_active = ?, source = ?, target = ? WHERE id = ?',
        [
          mappingUpdate.type,
          mappingUpdate.isActive ? 1 : 0,
          mappingUpdate.source,
          mappingUpdate.target,
          id,
        ],
      );

      await Promise.all([updatedPromise]);

      return databaseAccessor.mappingTable.getMappingEntries(
        mappingUpdate.type,
      );
    },
    updateMappingEntries: async (
      entries: MappingTableEntry[],
      type: HealthConnectMappingType,
    ): Promise<MappingTableEntry[]> => {
      const updatePromises = entries.map(entry =>
        database.execute(
          'UPDATE mapping_entries SET type = ?, is_active = ?, source = ?, target = ? WHERE id = ?',
          [
            entry.type,
            entry.isActive ? 1 : 0,
            entry.source,
            entry.target,
            entry.id,
          ],
        ),
      );
      await Promise.all(updatePromises);

      return databaseAccessor.mappingTable.getMappingEntries(type);
    },
    deleteMappingEntry: async (
      id: number,
      type: HealthConnectMappingType,
    ): Promise<MappingTableEntry[]> => {
      await database.execute('DELETE FROM mapping_entries WHERE id = ?', [id]);
      return databaseAccessor.mappingTable.getMappingEntries(type);
    },
  },
};
export default database;
