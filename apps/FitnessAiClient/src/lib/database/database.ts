import { DB, open, QueryResult } from '@op-engineering/op-sqlite';
import { migrateDatabaseToV1 } from './databaseScripts';

const DatabaseName = 'fitnessai.db';

const database = async (): Promise<DB> => {
  const db = open({ name: DatabaseName });
  await migrateDatabaseToV1(db);
  return db;
};

const closeDatabase = async (db: DB): Promise<void> => {
  await db.close();
};

const queryDbData = async (
  db: DB,
  query: string,
  params: any[] = [],
): Promise<QueryResult> => {
  const result = await db.execute(query, params);
  return result;
};
export { database, closeDatabase, queryDbData };
