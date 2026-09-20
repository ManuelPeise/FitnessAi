import { closeDatabase, database, queryDbData } from './database';
import databaseTableModelMapper from './databaseTableModelMapper';
import { ScheduleTable } from '../../types/database/ScheduleTable';
import { ScheduleTypeEnum } from '../../types/enums/ScheduleTypeEnum';

type SaveScheduleInput = {
  userId: number;
  type: ScheduleTypeEnum;
  payloadJson: string;
};

const getSchedulesByUserId = async (
  userId: number,
): Promise<ScheduleTable[]> => {
  const db = await database();
  try {
    const result = await queryDbData(
      db,
      'SELECT * FROM ScheduleTable WHERE userId = ? ORDER BY id;',
      [userId],
    );
    return databaseTableModelMapper.mapResultToScheduleTable(result);
  } finally {
    await closeDatabase(db);
  }
};

const getScheduleByUserIdAndType = async (
  userId: number,
  type: ScheduleTypeEnum,
): Promise<ScheduleTable | null> => {
  const db = await database();
  try {
    const result = await queryDbData(
      db,
      'SELECT * FROM ScheduleTable WHERE userId = ? AND type = ?;',
      [userId, type],
    );
    const rows = databaseTableModelMapper.mapResultToScheduleTable(result);
    return rows[0] ?? null;
  } finally {
    await closeDatabase(db);
  }
};

const saveSchedule = async ({
  userId,
  type,
  payloadJson,
}: SaveScheduleInput): Promise<ScheduleTable> => {
  const db = await database();
  try {
    await queryDbData(
      db,
      `INSERT INTO ScheduleTable (userId, type, payloadJson)
       VALUES (?, ?, ?)
       ON CONFLICT(userId, type) DO UPDATE SET
         payloadJson = excluded.payloadJson,
         updatedAt = datetime('now');`,
      [userId, type, payloadJson],
    );
  } finally {
    await closeDatabase(db);
  }

  const saved = await getScheduleByUserIdAndType(userId, type);
  if (!saved) {
    throw new Error('Failed to persist schedule.');
  }
  return saved;
};

const deleteSchedule = async (
  userId: number,
  type: ScheduleTypeEnum,
): Promise<void> => {
  const db = await database();
  try {
    await queryDbData(
      db,
      'DELETE FROM ScheduleTable WHERE userId = ? AND type = ?;',
      [userId, type],
    );
  } finally {
    await closeDatabase(db);
  }
};

export const scheduleTableAccessor = {
  getSchedulesByUserId,
  getScheduleByUserIdAndType,
  saveSchedule,
  deleteSchedule,
};
