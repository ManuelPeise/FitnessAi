export const UserRoleEnum = {
  Admin: 0,
  User: 1,
} as const;

export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];
