export const IntervallTypeEnum = {
  Unknown: -1,
  Hourly: 0,
  Daily: 1,
  Weekly: 2,
} as const;

export type IntervallTypeEnum =
  (typeof IntervallTypeEnum)[keyof typeof IntervallTypeEnum];
