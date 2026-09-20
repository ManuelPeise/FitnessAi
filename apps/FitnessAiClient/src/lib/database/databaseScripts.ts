import type { DB } from '@op-engineering/op-sqlite';

const migrateDatabaseToV1 = async (db: DB): Promise<void> => {
  await db.execute('PRAGMA foreign_keys = ON;');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS UserDataTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      credentialsId INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS UserAuthenticationTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      jwt TEXT NOT NULL,
      refreshToken TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY (userId)
        REFERENCES UserDataTable(id)
        ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS SettingsTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      lang TEXT NOT NULL DEFAULT 'en'
        CHECK (lang IN ('en', 'de')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY (userId)
        REFERENCES UserDataTable(id)
        ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ScheduleTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL
        CHECK (
          type IN (
            'HealthDataExport',
            'ExerciseDataExport'
          )
        ),
      intervalType INTEGER NOT NULL
        CHECK (intervalType IN (0, 1, 2)),
      day INTEGER NULL
        CHECK (day IS NULL OR day BETWEEN 1 AND 7),
      hour INTEGER NULL
        CHECK (hour IS NULL OR hour BETWEEN 0 AND 23),
      minute INTEGER NULL
        CHECK (minute IS NULL OR minute BETWEEN 0 AND 59),
      isActive INTEGER NOT NULL DEFAULT 1
        CHECK (isActive IN (0, 1)),
      lastRunAt TEXT NULL,
      lastSuccessAt TEXT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY (userId)
        REFERENCES UserDataTable(id)
        ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS DailyHealthDataTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      recordId TEXT NOT NULL,
      recordType TEXT NOT NULL,
      date TEXT NOT NULL,
      value REAL NOT NULL,
      dataOrigin TEXT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

      UNIQUE (userId, recordId),

      FOREIGN KEY (userId)
        REFERENCES UserDataTable(id)
        ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ExerciseTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      exerciseId INTEGER NOT NULL,
      dataOrigin TEXT NULL,
      exerciseType TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      durationSeconds REAL NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

      UNIQUE (userId, exerciseId),

      FOREIGN KEY (userId)
        REFERENCES UserDataTable(id)
        ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ExerciseValuesTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      valueType TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),

      FOREIGN KEY (exerciseId)
        REFERENCES ExerciseTable(id)
        ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_authentication_userId
    ON UserAuthenticationTable(userId);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_schedule_userId
    ON ScheduleTable(userId);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_health_userId_date
    ON DailyHealthDataTable(userId, date);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_exercise_userId_startTime
    ON ExerciseTable(userId, startTime);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_exercise_values_exerciseId
    ON ExerciseValuesTable(exerciseId);
  `);
};

export { migrateDatabaseToV1 };
