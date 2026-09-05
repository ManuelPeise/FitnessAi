import { database } from './database';
import { createDatabaseScript } from './databaseTypes';

export const migrateDatabase = async (): Promise<void> => {
  await database.execute(createDatabaseScript);
};
