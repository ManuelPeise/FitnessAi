import { apiClient } from "../../lib/api";
import type {
  AuthenticatedUser,
  LoginCredentials,
  RegisterCredentials,
} from "./authentication.types";

const loginPath =
  import.meta.env.VITE_API_LOGIN_PATH ?? "UserAuthentication/AuthenticateUser";
const registerPath = import.meta.env.VITE_API_REGISTER_PATH ?? "/auth/register";
const currentUserPath =
  import.meta.env.VITE_API_CURRENT_USER_PATH ?? "/CurrentUser/GetCurrentUser";

export const authenticationApi = {
  getCurrentUser: (): Promise<AuthenticatedUser> =>
    apiClient.get<AuthenticatedUser>(currentUserPath),

  login: (credentials: LoginCredentials): Promise<void> =>
    apiClient.post<void, LoginCredentials>(loginPath, credentials),

  register: (credentials: RegisterCredentials): Promise<void> =>
    apiClient.post<void, RegisterCredentials>(registerPath, credentials),
};
