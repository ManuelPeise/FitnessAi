import { database } from './database';
import { createDatabaseScript } from './databaseTypes';

const latestDatabaseVersion = 4;

const getTableColumns = async (tableName: string): Promise<string[]> => {
  const result = await database.execute(`PRAGMA table_info(${tableName})`);

  return result.rows.map(row => String(row.name));
};

/**
 * Rebuilds `schedule_settings` into the canonical shape. Earlier versions
 * shipped an `interval` column, later a `'Daily'` frequency value, a `day`
 * column and no `is_active` column, so the legacy row set is translated
 * column by column.
 */
const migrateScheduleSettings = async (): Promise<void> => {
  const columns = await getTableColumns('schedule_settings');

  if (columns.length === 0) {
    return;
  }

  const pickColumn = (candidates: string[], fallback: string): string =>
    candidates.find(candidate => columns.includes(candidate)) ?? fallback;

  const dayColumn = pickColumn(['day_of_week', 'day'], '0');
  const isActiveColumn = pickColumn(['is_active'], '0');
  const hourColumn = pickColumn(['hour'], '0');
  const minuteColumn = pickColumn(['minute'], '0');
  const frequencyColumn = pickColumn(['frequency', 'interval'], "'daily'");
  const lastExecutedColumn = pickColumn(['last_executed_at'], 'NULL');
  const lastExecutionStatusColumn = pickColumn(['last_execution_status'], "'idle'");
  const lastExecutionErrorColumn = pickColumn(['last_execution_error'], 'NULL');

  await database.execute(
    'ALTER TABLE schedule_settings RENAME TO schedule_settings_legacy',
  );

  await database.execute(createDatabaseScript);

  await database.execute(`
    INSERT INTO schedule_settings
      (id, type, is_active, hour, minute, frequency, day_of_week, last_executed_at, last_execution_status, last_execution_error)
    SELECT
      id,
      type,
      COALESCE(${isActiveColumn}, 0),
      COALESCE(${hourColumn}, 0),
      COALESCE(${minuteColumn}, 0),
      CASE LOWER(COALESCE(${frequencyColumn}, 'daily'))
        WHEN 'hourly' THEN 'hourly'
        WHEN 'weekly' THEN 'weekly'
        ELSE 'daily'
      END,
      COALESCE(${dayColumn}, 0),
      NULLIF(${lastExecutedColumn}, ''),
      CASE LOWER(COALESCE(${lastExecutionStatusColumn}, 'idle'))
        WHEN 'running' THEN 'running'
        WHEN 'success' THEN 'success'
        WHEN 'failed' THEN 'failed'
        WHEN 'skipped' THEN 'skipped'
        ELSE 'idle'
      END,
      NULLIF(${lastExecutionErrorColumn}, '')
    FROM schedule_settings_legacy
    WHERE type IN ('HealthConnectExerciseDataExport', 'HealthConnectHealthDataExport')
  `);

  await database.execute('DROP TABLE schedule_settings_legacy');
};

export const migrateDatabase = async (): Promise<void> => {
  const versionResult = await database.execute('PRAGMA user_version');
  const currentVersion = Number(versionResult.rows[0]?.user_version ?? 0);

  if (currentVersion >= latestDatabaseVersion) {
    return;
  }

  if (currentVersion === 0) {
    await database.execute(createDatabaseScript);
    await database.execute(`PRAGMA user_version = ${latestDatabaseVersion}`);
    return;
  }

  if (currentVersion === 1) {
    await database.execute(`
      ALTER TABLE api_authentication RENAME TO api_authentication_legacy;
      CREATE TABLE api_authentication (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        token_expiration TEXT NOT NULL DEFAULT '',
        app_key TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO api_authentication
        (id, access_token, refresh_token, created_at, updated_at)
      SELECT id, access_token, refresh_token, created_at, updated_at
      FROM api_authentication_legacy;
      DROP TABLE api_authentication_legacy;
    `);
  }

  if (currentVersion <= 3) {
    await migrateScheduleSettings();
  }

  await database.execute(createDatabaseScript);
  await database.execute(`PRAGMA user_version = ${latestDatabaseVersion}`);
};
