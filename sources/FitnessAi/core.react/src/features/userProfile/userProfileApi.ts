import { apiClient } from "../../lib/api";
import type { ChangePasswordRequest, UpdateUserProfileRequest, UserProfile } from "./userProfile.types";

const controllerPath = "UserProfile";

export const userProfileApi = {
  getProfile: (): Promise<UserProfile> => apiClient.get<UserProfile>(`${controllerPath}/GetProfile`),

  updateProfile: (request: UpdateUserProfileRequest): Promise<void> =>
    apiClient.put<void, UpdateUserProfileRequest>(`${controllerPath}/UpdateProfile`, request),

  changePassword: (request: ChangePasswordRequest): Promise<void> =>
    apiClient.put<void, ChangePasswordRequest>(`${controllerPath}/ChangePassword`, request),
};
