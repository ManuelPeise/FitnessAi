import React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import {
  secureStorage,
  SecureStorageKeys,
} from '../../lib/services/storage/secureStorage';
import { apiClient } from '../../lib/services/api/axiosClient';
import { databaseAccessor } from '../../lib/database/database';
import { ApiAuthenticationTableEntry } from '../../lib/database/databaseTypes';

type TokenResponse = {
  token: string;
  refreshToken: string;
  tokenExpiresAt: string;
  appId: string;
};

type User = {
  id: number;
  email: string;
  created_at: string | null;
  updated_at: string | null;
};

type LoginRequest = {
  email: string;
  password: string;
};

type AuthenticationContextResult = {
  isAuthenticated: boolean;
  currentUserId: number | null;
  isInitializing: boolean;
  isLoading: boolean;
  handleLogin: (request: LoginRequest) => Promise<void>;
  handleLogout: () => Promise<void>;
};

type IAuthContextProviderProps = React.PropsWithChildren;

const AuthenticationContext =
  React.createContext<AuthenticationContextResult | null>(null);

const AuthenticationProvider: React.FC<IAuthContextProviderProps> = props => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const getTokens = React.useCallback(async () => {
    const token = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
    const refreshToken = await secureStorage.getItem(
      SecureStorageKeys.REFRESH_TOKEN,
    );
    return !!token && !!refreshToken;
  }, []);

  const getCurrentUserId = React.useCallback(async () => {
    const currentUserIdValue = await secureStorage.getItem(
      SecureStorageKeys.CURRENT_USER_ID,
    );

    if (currentUserIdValue) {
      return parseInt(currentUserIdValue, 10);
    }

    return null;
  }, []);

  const handleLogin = async (request: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(
        'UserAuthentication/AuthenticateUserOnMobile',
        request,
      );

      if (response && response.status === 200 && response.data) {
        const tokenResponse: TokenResponse = await response.data;

        if (
          !tokenResponse.token ||
          !tokenResponse.refreshToken ||
          !tokenResponse.tokenExpiresAt ||
          !tokenResponse.appId
        ) {
          throw new Error('Missing authentication tokens or app ID');
        }

        const config: AxiosRequestConfig = {
          headers: {
            Authorization: `Bearer ${tokenResponse.token}`,
          },
        };
        const userResponse = await apiClient.get(
          'CurrentUser/GetCurrentUser',
          config,
        );

        if (
          !userResponse ||
          userResponse.status !== 200 ||
          !userResponse.data
        ) {
          throw new Error('Failed to fetch user information');
        }

        const user: User = userResponse.data;

        const authentication =
          await databaseAccessor.authentication.getAuthentication(user.id);

        if (authentication == null) {
          const authenticationEntry: ApiAuthenticationTableEntry = {
            id: -1,
            userId: user.id,
            accessToken: tokenResponse.token,
            refreshToken: tokenResponse.refreshToken,
            tokenExpiration: tokenResponse.tokenExpiresAt,
            appKey: tokenResponse.appId,
            created_at: null,
            updated_at: null,
          };

          await databaseAccessor.authentication.saveAuthentication(
            authenticationEntry,
          );
        } else {
          const updatedAuthenticationEntry: ApiAuthenticationTableEntry = {
            ...authentication,
            accessToken: tokenResponse.token,
            refreshToken: tokenResponse.refreshToken,
            tokenExpiration: tokenResponse.tokenExpiresAt,
            appKey: tokenResponse.appId,
            updated_at: null,
          };

          await databaseAccessor.authentication.saveAuthentication(
            updatedAuthenticationEntry,
          );
        }

        await secureStorage.setItem(
          SecureStorageKeys.ACCESS_TOKEN,
          tokenResponse.token,
        );
        await secureStorage.setItem(
          SecureStorageKeys.REFRESH_TOKEN,
          tokenResponse.refreshToken,
        );
        await secureStorage.setItem(
          SecureStorageKeys.CURRENT_USER_ID,
          user.id.toString(),
        );

        setCurrentUserId(user.id);
        setIsAuthenticated(true);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const requestUrl = err.config?.url ?? 'unknown-url';
        const requestMethod = err.config?.method ?? 'unknown-method';
        console.error('Login process failed with Axios error.', {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          requestUrl,
          requestMethod,
        });

        if (err.response?.status === 401) {
          throw new Error('Invalid email or password.');
        }

        throw new Error(
          'Unable to reach the server. Verify backend connectivity and try again.',
        );
      }

      console.error('Login process failed:', err);
      throw err instanceof Error ? err : new Error('Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await secureStorage.removeItem(SecureStorageKeys.ACCESS_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.CURRENT_USER_ID);
      setIsAuthenticated(false);
      setCurrentUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const checkToken = async () => {
      setIsInitializing(true);
      try {
        const tokenExists = await getTokens();
        if (!tokenExists) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
          return;
        }

        const parsedUserId = await getCurrentUserId();

        if (!parsedUserId) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
          return;
        }

        setCurrentUserId(parsedUserId);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to initialize authenticated user state.', error);
        setIsAuthenticated(false);
        setCurrentUserId(null);
      } finally {
        setIsInitializing(false);
      }
    };
    checkToken();
  }, [getTokens]);

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated,
        currentUserId,
        isInitializing,
        isLoading,
        handleLogin,
        handleLogout,
      }}
    >
      {props.children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
