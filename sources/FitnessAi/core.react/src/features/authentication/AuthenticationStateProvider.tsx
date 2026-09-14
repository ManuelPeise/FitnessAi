import React, { type ReactNode } from "react";
import { setUnauthorizedHandler } from "../../lib/api";
import { authenticationApi } from "./authenticationApi";
import {
  AuthenticationStateContext,
  type AuthenticationState,
} from "./AuthenticationStateContext";
import type {
  AuthenticatedUser,
  LoginCredentials,
  RegisterCredentials,
} from "./authentication.types";

type AuthenticationStateProviderProps = {
  children: ReactNode;
};

export const AuthenticationStateProvider = ({
  children,
}: AuthenticationStateProviderProps) => {
  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  const clearAuthentication = React.useCallback((): void => {
    setUser(null);
  }, []);

  React.useEffect(() => {
    setUnauthorizedHandler(clearAuthentication);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearAuthentication]);

  React.useEffect(() => {
    let isActive = true;

    const initialize = async (): Promise<void> => {
      try {
        const currentUser = await authenticationApi.getCurrentUser();

        if (isActive) {
          setUser(currentUser);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    };

    void initialize();

    return () => {
      isActive = false;
    };
  }, []);

  const login = React.useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      await authenticationApi.login(credentials);
      const currentUser = await authenticationApi.getCurrentUser();
      setUser(currentUser);
    },
    [],
  );

  const register = React.useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      await authenticationApi.register(credentials);
      const currentUser = await authenticationApi.getCurrentUser();
      setUser(currentUser);
    },
    [],
  );

  const logout = React.useCallback((): void => {
    authenticationApi.logout().finally(() => {
      setUser(null);
    });
  }, []);

  const value = React.useMemo<AuthenticationState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      register,
      logout,
    }),
    [isInitializing, login, register, logout, user],
  );

  return (
    <AuthenticationStateContext value={value}>
      {children}
    </AuthenticationStateContext>
  );
};
