import type { UserRoleEnum } from "../../lib/enums/userRoleEnum";

export type UserAdministrationListItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  deletedAt: string | null;
  userRole: UserRoleEnum;
};

export type UserAdministrationDetails = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  deletedAt: string | null;
  userRole: UserRoleEnum;
  createdAt: string;
};

export type UpdateUserRolesRequest = {
  userRole: UserRoleEnum;
};

export type UpdateUserActiveStateRequest = {
  isActive: boolean;
};
