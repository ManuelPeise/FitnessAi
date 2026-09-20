import { DB } from '@op-engineering/op-sqlite';
import { closeDatabase, database, queryDbData } from './database';
import databaseTableModelMapper from './databaseTableModelMapper';
import { UserDataTable } from '../../types/database/UserDataTable';

type SaveUserDataInput = {
  credentialsId: number;
  firstName: string;
  lastName: string;
  email: string;
};

const findByCredentialsId = async (
  db: DB,
  credentialsId: number,
): Promise<UserDataTable | null> => {
  const result = await queryDbData(
    db,
    'SELECT * FROM UserDataTable WHERE credentialsId = ?;',
    [credentialsId],
  );
  const rows = databaseTableModelMapper.mapResultToUserDataTableEntries(result);
  return rows[0] ?? null;
};

const saveUserData = async ({
  credentialsId,
  firstName,
  lastName,
  email,
}: SaveUserDataInput): Promise<UserDataTable> => {
  const db = await database();
  try {
    const existing = await findByCredentialsId(db, credentialsId);

    if (existing) {
      await queryDbData(
        db,
        `UPDATE UserDataTable
         SET firstName = ?, lastName = ?, email = ?, updatedAt = datetime('now')
         WHERE credentialsId = ?;`,
        [firstName, lastName, email, credentialsId],
      );
    } else {
      await queryDbData(
        db,
        'INSERT INTO UserDataTable (firstName, lastName, email, credentialsId) VALUES (?, ?, ?, ?);',
        [firstName, lastName, email, credentialsId],
      );
    }

    const saved = await findByCredentialsId(db, credentialsId);
    if (!saved) {
      throw new Error('Failed to persist user data.');
    }
    return saved;
  } finally {
    await closeDatabase(db);
  }
};

const getStoredUserData = async (): Promise<UserDataTable | null> => {
  const db = await database();
  try {
    const result = await queryDbData(
      db,
      'SELECT * FROM UserDataTable ORDER BY id DESC LIMIT 1;',
    );
    const rows = databaseTableModelMapper.mapResultToUserDataTableEntries(result);
    return rows[0] ?? null;
  } finally {
    await closeDatabase(db);
  }
};

export const userDataAccessor = {
  saveUserData,
  getStoredUserData,
};
