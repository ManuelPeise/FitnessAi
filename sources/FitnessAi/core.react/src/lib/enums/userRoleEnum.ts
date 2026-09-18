export const UserRoleEnum = {
  None: 0,
  User: 1,
  Admin: 2,
  Maintenance: 4,
} as const;

export type UserRoleEnum = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export const hasRole = (roles: UserRoleEnum, role: UserRoleEnum): boolean =>
  (roles & role) === role;
