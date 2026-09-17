export const WorkoutIntensityEnum = {
  Unknown: 0,
  Easy: 1,
  Medium: 2,
  High: 3,
} as const;

export type WorkoutIntensityEnum = (typeof WorkoutIntensityEnum)[keyof typeof WorkoutIntensityEnum];

export const workoutIntensityLabelKeys: Record<WorkoutIntensityEnum, string> = {
  [WorkoutIntensityEnum.Unknown]: "common.workoutIntensity.unknown",
  [WorkoutIntensityEnum.Easy]: "common.workoutIntensity.easy",
  [WorkoutIntensityEnum.Medium]: "common.workoutIntensity.medium",
  [WorkoutIntensityEnum.High]: "common.workoutIntensity.high",
};

export const editableWorkoutIntensities: WorkoutIntensityEnum[] = [
  WorkoutIntensityEnum.Easy,
  WorkoutIntensityEnum.Medium,
  WorkoutIntensityEnum.High,
];
