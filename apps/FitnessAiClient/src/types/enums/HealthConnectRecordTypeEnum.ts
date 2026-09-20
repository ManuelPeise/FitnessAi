export enum HealthConnectRecordTypeEnum {
  // Activity
  Steps = 'Steps',
  Exercise = 'Exercise',
  Distance = 'Distance',
  FloorsClimbed = 'FloorsClimbed',
  ActiveCaloriesBurned = 'ActiveCaloriesBurned',
  TotalCaloriesBurned = 'TotalCaloriesBurned',

  // Heart / cardiovascular
  HeartRate = 'HeartRate',
  RestingHeartRate = 'RestingHeartRate',
  HeartRateVariability = 'HeartRateVariability',

  // Respiratory
  RespiratoryRate = 'RespiratoryRate',
  OxygenSaturation = 'OxygenSaturation',
  Vo2Max = 'Vo2Max',

  // Sleep
  Sleep = 'Sleep',

  // Body measurements
  Weight = 'Weight',
  Height = 'Height',
  BodyFat = 'BodyFat',
  LeanBodyMass = 'LeanBodyMass',
  BoneMass = 'BoneMass',

  // Hydration / nutrition
  Hydration = 'Hydration',
  Nutrition = 'Nutrition',

  // Blood pressure
  BloodPressure = 'BloodPressure',
  BloodGlucose = 'BloodGlucose',

  // Temperature
  BodyTemperature = 'BodyTemperature',
}
