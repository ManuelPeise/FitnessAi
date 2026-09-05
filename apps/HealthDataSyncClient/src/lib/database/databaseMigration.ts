import { database } from './database';
import { createDatabaseScript } from './databaseTypes';

const latestDatabaseVersion = 1;

export const migrateDatabase = async (): Promise<void> => {
  const versionResult = await database.execute('PRAGMA user_version');
  const currentVersion = Number(versionResult.rows[0]?.user_version ?? 0);

  if (currentVersion >= latestDatabaseVersion) {
    return;
  }

  await database.execute(createDatabaseScript);
  await database.execute(`PRAGMA user_version = ${latestDatabaseVersion}`);
};
