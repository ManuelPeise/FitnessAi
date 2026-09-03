export type HealthConnectMappingType =
  | 'HealthConnectOrigin'
  | 'HealthConnectMetric';

export type ScheduleSettingsType =
  | 'HealthConnectExerciseDataExport'
  | 'HealthConnectHealthDataExport';
export type ScheduleInterval = 'Daily' | 'Weekly' | 'Monthly' | 'specificDay';
export type ScheduleDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type ScheduleHour = 0 | 6 | 12 | 18;

export type ScheduleMinute = 0 | 15 | 30 | 45;

export type ApiAuthenticationTableEntry = {
  id: number;
  accessToken: string;
  refreshToken: string;
  appIdentifier: string;
  created_at: string;
  updated_at: string;
};

export type ScheduleSettingsTableEntry = {
  id: number;
  type: ScheduleSettingsType;
  interval: ScheduleInterval;
  specificDay?: ScheduleDay;
  hour?: ScheduleHour;
  minute?: ScheduleMinute;
};

export type MappingTableEntry = {
  id: number;
  type: HealthConnectMappingType;
  isActive: boolean;
  source: string;
  target: string;
};

export const createDatabaseScript = `
CREATE TABLE IF NOT EXISTS mapping_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('HealthConnectOrigin', 'HealthConnectMetric')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (type, source)
);

CREATE TABLE IF NOT EXISTS api_authentication (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  app_identifier TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('HealthConnectExerciseDataExport', 'HealthConnectHealthDataExport')),
  interval TEXT NOT NULL CHECK (interval IN ('Daily', 'Weekly', 'Monthly', 'specificDay')),
  specific_day TEXT CHECK (specific_day IS NULL OR specific_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  hour INTEGER CHECK (hour IS NULL OR hour IN (0, 6, 12, 18)),
  minute INTEGER CHECK (minute IS NULL OR minute IN (0, 15, 30, 45)),
  UNIQUE (type)
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
AFTER UPDATE OF access_token, refresh_token, app_identifier ON api_authentication
BEGIN
  UPDATE api_authentication
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
`;
