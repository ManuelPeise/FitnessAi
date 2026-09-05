export type HealthConnectMappingType =
  | 'HealthConnectOrigin'
  | 'HealthConnectMetric';

export type ScheduleSettingsType =
  | 'HealthConnectExerciseDataExport'
  | 'HealthConnectHealthDataExport';

export const scheduleSettingsTypes: ScheduleSettingsType[] = [
  'HealthConnectExerciseDataExport',
  'HealthConnectHealthDataExport',
];

export type ScheduleFrequency = 'daily' | 'hourly' | 'weekly';
export type ScheduleExecutionStatus =
  | 'idle'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped';

export type ApiAuthenticationTableEntry = {
  id: number;
  userId: number;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiration: string | null;
  appKey: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type UserTableEntry = {
  id: number;
  email: string;
  password: string;
  created_at: string | null;
  updated_at: string | null;
};

export type ScheduleSettingsTableEntry = {
  id: number;
  userId: number;
  type: ScheduleSettingsType;
  isActive: boolean;
  hour: number;
  minute: number;
  frequency: ScheduleFrequency;
  dayOfWeek: number;
  lastExecutedAt: string | null;
  lastExecutionStatus: ScheduleExecutionStatus;
  lastExecutionError: string | null;
};

export type MappingTableEntry = {
  id: number;
  userId: number;
  type: HealthConnectMappingType;
  isActive: boolean;
  source: string;
  target: string;
};

export const createDatabaseScript = `
CREATE TABLE IF NOT EXISTS mapping_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HealthConnectOrigin', 'HealthConnectMetric')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, type, source)
);

CREATE TABLE IF NOT EXISTS api_authentication (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expiration TEXT,
  app_key TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HealthConnectExerciseDataExport', 'HealthConnectHealthDataExport')),
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  hour INTEGER NOT NULL DEFAULT 0,
  minute INTEGER NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'hourly', 'weekly')),
  day_of_week INTEGER NOT NULL DEFAULT 0,
  last_executed_at TEXT,
  last_execution_status TEXT NOT NULL DEFAULT 'idle' CHECK (last_execution_status IN ('idle', 'running', 'success', 'failed', 'skipped')),
  last_execution_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_mapping_entries_type
  ON mapping_entries (type);

CREATE TRIGGER IF NOT EXISTS mapping_entries_updated_at
AFTER UPDATE OF type, is_active, source, target ON mapping_entries
BEGIN
  UPDATE mapping_entries
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS api_authentication_updated_at
AFTER UPDATE OF access_token, refresh_token, token_expiration, app_key ON api_authentication
BEGIN
  UPDATE api_authentication
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS schedule_settings_updated_at
AFTER UPDATE OF type, is_active, hour, minute, frequency, day_of_week, last_executed_at, last_execution_status, last_execution_error ON schedule_settings
BEGIN
  UPDATE schedule_settings
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
`;
