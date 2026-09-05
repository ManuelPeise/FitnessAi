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
  ascendingOrder?: boolean;
  pageSize?: number;
  pageToken?: string;
};

export type HealthConnectData = {
  steps: ReadRecordsResult<'Steps'>;
  exerciseSessions: ReadRecordsResult<'ExerciseSession'>;
};
