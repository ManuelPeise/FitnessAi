import {
  Permission,
  WriteExerciseRoutePermission,
  BackgroundAccessPermission,
  ReadHealthDataHistoryPermission,
  ReadRecordsResult,
} from 'react-native-health-connect';

export type HealthConnectPermission =
  | Permission
  | WriteExerciseRoutePermission
  | BackgroundAccessPermission
  | ReadHealthDataHistoryPermission;

export type HealthConnectReadRange = {
  startTime: Date | string;
  endTime: Date | string;
  dataOriginFilter?: string[];
  ascendingOrder?: boolean;
  pageSize?: number;
  pageToken?: string;
};

export type HealthConnectData = {
  steps: ReadRecordsResult<'Steps'>;
  exerciseSessions: ReadRecordsResult<'ExerciseSession'>;
};

export enum HealthConnectExerciseType {
  OTHER_WORKOUT = 0,

  BADMINTON = 2,
  BASEBALL = 4,
  BASKETBALL = 5,

  BIKING = 8,
  BIKING_STATIONARY = 9,
  BOOT_CAMP = 10,
  BOXING = 11,
  CALISTHENICS = 13,
  CRICKET = 14,
  DANCING = 16,

  ELLIPTICAL = 25,
  EXERCISE_CLASS = 26,
  FENCING = 27,

  FOOTBALL_AMERICAN = 28,
  FOOTBALL_AUSTRALIAN = 29,
  FRISBEE_DISC = 31,
  GOLF = 32,
  GUIDED_BREATHING = 33,
  GYMNASTICS = 34,
  HANDBALL = 35,
  HIGH_INTENSITY_INTERVAL_TRAINING = 36,
  HIKING = 37,
  ICE_HOCKEY = 38,
  ICE_SKATING = 39,

  MARTIAL_ARTS = 44,

  PADDLING = 46,
  PARAGLIDING = 47,
  PILATES = 48,
  RACQUETBALL = 50,
  ROCK_CLIMBING = 51,
  ROLLER_HOCKEY = 52,
  ROWING = 53,
  ROWING_MACHINE = 54,
  RUGBY = 55,

  RUNNING = 56,
  RUNNING_TREADMILL = 57,
  SAILING = 58,
  SCUBA_DIVING = 59,
  SKATING = 60,
  SKIING = 61,
  SNOWBOARDING = 62,
  SNOWSHOEING = 63,
  SOCCER = 64,
  SOFTBALL = 65,
  SQUASH = 66,

  STAIR_CLIMBING = 68,
  STAIR_CLIMBING_MACHINE = 69,
  STRENGTH_TRAINING = 70,
  STRETCHING = 71,
  SURFING = 72,
  SWIMMING_OPEN_WATER = 73,
  SWIMMING_POOL = 74,
  TABLE_TENNIS = 75,
  TENNIS = 76,
  VOLLEYBALL = 78,
  WALKING = 79,
  WATER_POLO = 80,
  WEIGHTLIFTING = 81,
  WHEELCHAIR = 82,
  YOGA = 83,
}

export enum HealthConnectExerciseSegmentType {
  UNKNOWN = 0,

  BARBELL_SHOULDER_PRESS = 4,
  BENCH_SIT_UP = 6,
  BIKING = 7,
  BIKING_STATIONARY = 8,

  DUMBBELL_CURL_LEFT_ARM = 12,
  DUMBBELL_CURL_RIGHT_ARM = 13,
  DUMBBELL_FRONT_RAISE = 14,
  DUMBBELL_LATERAL_RAISE = 15,

  DUMBBELL_TRICEPS_EXTENSION_LEFT_ARM = 16,
  DUMBBELL_TRICEPS_EXTENSION_RIGHT_ARM = 17,
  DUMBBELL_TRICEPS_EXTENSION_TWO_ARM = 18,

  FORWARD_TWIST = 19,
  ELLIPTICAL = 20,
  HIGH_INTENSITY_INTERVAL_TRAINING = 21,

  JUMPING_JACK = 22,
  JUMP_ROPE = 23,
  LAT_PULL_DOWN = 24,
  LEG_CURL = 25,

  ARM_CURL = 1,
  BACK_EXTENSION = 2,
  BALL_SLAM = 3,
  BENCH_PRESS = 5,
  BURPEE = 9,
  CRUNCH = 10,
  DEADLIFT = 11,

  LUNGE = 36,
  MOUNTAIN_CLIMBER = 37,
  OTHER_WORKOUT = 38,
  PAUSE = 39,
  PILATES = 40,
  PLANK = 41,
  PULL_UP = 42,
  PUNCH = 43,
  REST = 44,
  ROWING_MACHINE = 45,

  RUNNING = 46,
  RUNNING_TREADMILL = 47,

  SHOULDER_PRESS = 48,
  SINGLE_ARM_TRICEPS_EXTENSION = 49,
  SIT_UP = 50,
  SQUAT = 51,
  STAIR_CLIMBING = 52,
  STAIR_CLIMBING_MACHINE = 53,
  STRETCHING = 54,

  SWIMMING_BACKSTROKE = 55,
  SWIMMING_BREASTSTROKE = 56,
  SWIMMING_BUTTERFLY = 57,
  SWIMMING_FREESTYLE = 58,
  SWIMMING_MIXED = 59,
  SWIMMING_OPEN_WATER = 60,
  SWIMMING_OTHER = 61,
  SWIMMING_POOL = 62,

  UPPER_TWIST = 63,
  WALKING = 64,
  WEIGHTLIFTING = 65,
  WHEELCHAIR = 66,
  YOGA = 67,
}

export type TimeZoneInfo = {
  offset: number;
  id: string;
};

export type HealthConnectTrainingMetricData = {
  heartRate?: number;
  maxHeartRate?: number;
  heartRateVariability?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  distance?: number;
  pace?: number;
  speed?: number;
  maxSpeed?: number;
  power?: number;
  maxPower?: number;
  elevation?: number;
  calories?: number;
  activeCalories?: number;
  steps?: number;
  cadence?: number;
  vo2Max?: number;
};

export type TrainingSegments = {
  segmentType: HealthConnectExerciseSegmentType;
  replications: number;
  startTime: Date | string;
  endTime: Date | string;
};

export type TrainingLap = {
  lengthInMeters: number;
  startTime: Date | string;
  endTime: Date | string;
};

export type HealthConnectTrainingData = {
  appKey: string; // from db [api_authentication] table
  startTime: Date | string;
  endTime: Date | string;
  exerciseType: HealthConnectExerciseType;
  origin: string;
  timeZoneInfo?: TimeZoneInfo;
  trainingMetricData: HealthConnectTrainingMetricData;
  trainingSegments?: TrainingSegments[];
  laps: TrainingLap[];
};
