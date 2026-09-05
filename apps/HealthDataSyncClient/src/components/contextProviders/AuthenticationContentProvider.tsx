import React from 'react';
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
  tokenExpiration: string;
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

  const initializeUserData = React.useCallback(async (userId: number) => {
    await databaseAccessor.initializeDatabase();
    await databaseAccessor.schedule.ensureSchedules(userId);
  }, []);

  const handleLogin = async (request: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(
        'UserAuthentication/AuthenticateUserOnMobile',
        request,
      );

      if (response && response.status === 200 && response.data) {
        const tokenResponse: TokenResponse = response.data;

        if (
          !tokenResponse.token ||
          !tokenResponse.refreshToken ||
          !tokenResponse.tokenExpiration ||
          !tokenResponse.appId
        ) {
          throw new Error('Missing authentication tokens or app ID');
        }

        const userResponse = await apiClient.get('CurrentUser/GetCurrentUser');

        if (
          !userResponse ||
          userResponse.status !== 200 ||
          !userResponse.data
        ) {
          throw new Error('Failed to fetch user information');
        }

        const user: User = userResponse.data;
        await initializeUserData(user.id);

        const authentication =
          await databaseAccessor.authentication.getAuthentication(user.id);

        if (authentication == null) {
          const authenticationEntry: ApiAuthenticationTableEntry = {
            id: -1,
            userId: user.id,
            accessToken: tokenResponse.token,
            refreshToken: tokenResponse.refreshToken,
            tokenExpiration: tokenResponse.tokenExpiration,
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
            tokenExpiration: tokenResponse.tokenExpiration,
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

        const userIdValue = await secureStorage.getItem(
          SecureStorageKeys.CURRENT_USER_ID,
        );
        const parsedUserId = Number(userIdValue);

        if (
          !userIdValue ||
          !Number.isInteger(parsedUserId) ||
          parsedUserId <= 0
        ) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
          return;
        }

        await initializeUserData(parsedUserId);
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
  }, [getTokens, initializeUserData]);

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
