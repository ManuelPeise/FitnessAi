import { apiClient } from "../../lib/api";
import type {
  UpdateUserActiveStateRequest,
  UpdateUserRolesRequest,
  UserAdministrationDetails,
  UserAdministrationListItem,
} from "./userAdministration.types";

const controllerPath = "UserAdministration";

export const userAdministrationApi = {
  getUsers: (): Promise<UserAdministrationListItem[]> =>
    apiClient.get<UserAdministrationListItem[]>(`${controllerPath}/GetUsers`),

  getUserDetails: (id: number): Promise<UserAdministrationDetails> =>
    apiClient.get<UserAdministrationDetails>(`${controllerPath}/GetUserDetails`, { params: { id } }),

  updateUserRoles: (id: number, request: UpdateUserRolesRequest): Promise<void> =>
    apiClient.put<void, UpdateUserRolesRequest>(`${controllerPath}/UpdateUserRoles`, request, { params: { id } }),

  updateActiveState: (id: number, request: UpdateUserActiveStateRequest): Promise<void> =>
    apiClient.put<void, UpdateUserActiveStateRequest>(`${controllerPath}/UpdateActiveState`, request, {
      params: { id },
    }),

  softDeleteUser: (id: number): Promise<void> =>
    apiClient.delete<void>(`${controllerPath}/SoftDeleteUser`, { params: { id } }),

  restoreUser: (id: number): Promise<void> =>
    apiClient.put<void>(`${controllerPath}/RestoreUser`, undefined, { params: { id } }),
};
