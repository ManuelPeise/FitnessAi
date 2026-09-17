export const AiModelTypeEnum = {
  Global: 0,
  User: 1,
  WorkoutIntensity: 2,
} as const;

export type AiModelTypeEnum = (typeof AiModelTypeEnum)[keyof typeof AiModelTypeEnum];
