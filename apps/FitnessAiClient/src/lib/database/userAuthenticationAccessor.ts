import { closeDatabase, database, queryDbData } from './database';
import databaseTableModelMapper from './databaseTableModelMapper';
import { UserAuthenticationTable } from '../../types/database/UserAuthenticationTable';

type SaveAuthenticationInput = {
  userId: number;
  jwt: string;
  refreshToken: string;
  expiresAt: string;
};

const getStoredAuthentication =
  async (): Promise<UserAuthenticationTable | null> => {
    const db = await database();
    try {
      const result = await queryDbData(
        db,
        'SELECT * FROM UserAuthenticationTable WHERE isCurrent = 1 LIMIT 1;',
      );
      const rows =
        databaseTableModelMapper.mapResultToUserAuthenticationTable(result);
      return rows[0] ?? null;
    } finally {
      await closeDatabase(db);
    }
  };

const saveAuthentication = async ({
  userId,
  jwt,
  refreshToken,
  expiresAt,
}: SaveAuthenticationInput): Promise<void> => {
  const db = await database();
  try {
    await db.transaction(async (tx) => {
      await tx.execute('UPDATE UserAuthenticationTable SET isCurrent = 0;');
      await tx.execute(
        `INSERT INTO UserAuthenticationTable (userId, jwt, refreshToken, expiresAt, isCurrent)
         VALUES (?, ?, ?, ?, 1)
         ON CONFLICT(userId) DO UPDATE SET
           jwt = excluded.jwt,
           refreshToken = excluded.refreshToken,
           expiresAt = excluded.expiresAt,
           isCurrent = 1,
           updatedAt = datetime('now');`,
        [userId, jwt, refreshToken, expiresAt],
      );
    });
  } finally {
    await closeDatabase(db);
  }
};

const clearAuthentication = async (userId: number): Promise<void> => {
  const db = await database();
  try {
    await queryDbData(
      db,
      'DELETE FROM UserAuthenticationTable WHERE userId = ?;',
      [userId],
    );
  } finally {
    await closeDatabase(db);
  }
};

export const userAuthenticationAccessor = {
  getStoredAuthentication,
  saveAuthentication,
  clearAuthentication,
};
