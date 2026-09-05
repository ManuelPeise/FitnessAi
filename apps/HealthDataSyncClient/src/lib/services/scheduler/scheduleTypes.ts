import {
  MappingTableEntry,
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';

export enum HealthConnectRecordTypeEnum {
  ActiveCaloriesBurned = 0,
  BasalBodyTemperature = 1,
  BasalMetabolicRate = 2,
  BloodGlucose = 3,
  BloodPressure = 4,
  BodyFat = 5,
  BodyTemperature = 6,
  BodyWaterMass = 7,
  BoneMass = 8,
  CervicalMucus = 9,
  CyclingPedalingCadence = 10,
  Distance = 11,
  ElevationGained = 12,
  ExerciseSession = 13,
  FloorsClimbed = 14,
  HeartRate = 15,
  HeartRateVariability = 16,
  Height = 17,
  Hydration = 18,
  IntermenstrualBleeding = 19,
  LeanBodyMass = 20,
  MenstruationFlow = 21,
  MenstruationPeriod = 22,
  Nutrition = 23,
  OvulationTest = 24,
  OxygenSaturation = 25,
  Power = 26,
  RespiratoryRate = 27,
  RestingHeartRate = 28,
  SexualActivity = 29,
  SkinTemperature = 30,
  SleepSession = 31,
  Speed = 32,
  Steps = 33,
  StepsCadence = 34,
  TotalCaloriesBurned = 35,
  Vo2Max = 36,
  Weight = 37,
  WheelchairPushes = 38,
  HeartRateVariabilityRmssd = 39,
}

export enum HealthConnectDataUnitEnum {
  KILOCALORIES = 0,
  REVOLUTIONS_PER_MINUTE = 1,
  METERS = 2,
  BEATS_PER_MINUTE = 3,
  MILLIS = 4,
  PERCENTAGE = 5,
  WATTS = 6,
  RATE = 7,
  KILOMETERS_PER_HOUR = 8,
}
export type HealthConnectMappingMap = { [key: string]: MappingTableEntry };

export type HealthConnectScheduleData = {
  originMappings: HealthConnectMappingMap;
  metricMappings: HealthConnectMappingMap;
  schedule: ScheduleSettingsTableEntry | null;
};

export type HealthConnectExportRequest = {
  type: ScheduleSettingsType;
  from: Date;
  to: Date;
};

export type HealthConnectExportMetaData = {
  from: Date;
  to: Date;
  origin: string;
  type: ScheduleSettingsType;
};

export type HealthConnectDataEntry = {
  type: HealthConnectRecordTypeEnum;
  unit: HealthConnectDataUnitEnum;
  value: number;
  startTimestamp: string;
  endTimestamp: string;
};

export type HealthConnectDataExport = {
  metadata: HealthConnectExportMetaData;
  data: HealthConnectDataEntry[];
};

export type HealthConnectDataExportModel = {
  payload: HealthConnectDataExport[];
  schedule: ScheduleSettingsTableEntry | null;
};
