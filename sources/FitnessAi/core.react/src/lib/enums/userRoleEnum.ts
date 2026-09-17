export const UserRoleEnum = {
  User: 0,
  Admin: 1,
  Maintenance: 2,
} as const;

export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];
