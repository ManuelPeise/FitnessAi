import { createContext } from "react";
import type {
  AuthenticatedUser,
  LoginCredentials,
  RegisterCredentials,
} from "./authentication.types";

export type AuthenticationState = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthenticationStateContext =
  createContext<AuthenticationState | null>(null);
