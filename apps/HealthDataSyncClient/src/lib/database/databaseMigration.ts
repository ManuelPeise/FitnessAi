import { database } from './database';
import { createDatabaseScript } from './databaseTypes';

const latestDatabaseVersion = 4;

export const migrateDatabase = async (): Promise<void> => {
  await database.execute(createDatabaseScript);
  await database.execute(`PRAGMA user_version = ${latestDatabaseVersion}`);
};
