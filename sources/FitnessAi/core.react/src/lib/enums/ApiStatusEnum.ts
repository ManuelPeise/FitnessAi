const ApiStatusEnum = {
  UNKNOWN: "unknown",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type ApiStatusEnum = (typeof ApiStatusEnum)[keyof typeof ApiStatusEnum];
