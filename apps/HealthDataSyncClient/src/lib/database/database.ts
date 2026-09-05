import { open } from '@op-engineering/op-sqlite';
import {
  createDatabaseScript,
  HealthConnectMappingType,
  MappingTableEntry,
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

export const databaseAccessor = {
  initializeDatabase: async (): Promise<void> => {
    await database.execute(createDatabaseScript);
    await migrateDatabase();
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
