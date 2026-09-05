import React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import {
  secureStorage,
  SecureStorageKeys,
  UserInfo,
} from '../../lib/services/storage/secureStorage';
import { apiClient } from '../../lib/services/api/axiosClient';
import { databaseAccessor } from '../../lib/database/database';
import { ApiAuthenticationTableEntry } from '../../lib/database/databaseTypes';
import {
  getCurrentLanguage,
  getResource,
  onLanguageChanged,
  subscribeLanguageChanged,
} from '../../lib/localization';

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

  const getUserInfo = React.useCallback(async (): Promise<UserInfo | null> => {
    const serialized = await secureStorage.getItem(SecureStorageKeys.USER_INFO);

    if (!serialized) {
      return null;
    }

    try {
      const parsed = JSON.parse(serialized) as UserInfo;

      if (
        typeof parsed !== 'object' ||
        parsed == null ||
        typeof parsed.isAuthenticated !== 'boolean' ||
        (parsed.userId != null && !Number.isInteger(parsed.userId)) ||
        (parsed.selectedLanguage !== 'en' && parsed.selectedLanguage !== 'de')
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, []);

  const setUserInfo = React.useCallback(async (userInfo: UserInfo) => {
    await secureStorage.setItem(
      SecureStorageKeys.USER_INFO,
      JSON.stringify(userInfo),
    );
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
          throw new Error(
            getResource('common.descriptionMissingAuthTokensOrAppId'),
          );
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
          throw new Error(
            getResource('common.descriptionFailedToFetchUserInfo'),
          );
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
            selectedLanguage: getCurrentLanguage(),
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
            selectedLanguage:
              authentication.selectedLanguage ?? getCurrentLanguage(),
            updated_at: null,
          };

          await databaseAccessor.authentication.saveAuthentication(
            updatedAuthenticationEntry,
          );
        }

        const selectedLanguage =
          authentication?.selectedLanguage ?? getCurrentLanguage();

        onLanguageChanged(selectedLanguage);

        await setUserInfo({
          userId: user.id,
          isAuthenticated: true,
          selectedLanguage,
        });

        setCurrentUserId(user.id);
        setIsAuthenticated(true);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          throw new Error(
            getResource('common.descriptionInvalidEmailOrPassword'),
          );
        }

        throw new Error(getResource('common.descriptionUnableToReachServer'));
      }

      throw err instanceof Error
        ? err
        : new Error(getResource('common.descriptionLoginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await secureStorage.removeItem(SecureStorageKeys.USER_INFO);
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
        const userInfo = await getUserInfo();

        if (
          userInfo == null ||
          !userInfo.isAuthenticated ||
          userInfo.userId == null
        ) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
          return;
        }

        const authentication =
          await databaseAccessor.authentication.getAuthentication(
            userInfo.userId,
          );

        if (
          authentication == null ||
          !authentication.accessToken ||
          !authentication.refreshToken
        ) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
          return;
        }

        if (authentication?.selectedLanguage) {
          onLanguageChanged(authentication.selectedLanguage);
        } else {
          onLanguageChanged(userInfo.selectedLanguage);
        }

        setCurrentUserId(userInfo.userId);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(
          getResource('common.descriptionInitializeAuthStateFailed'),
          error,
        );
        setIsAuthenticated(false);
        setCurrentUserId(null);
      } finally {
        setIsInitializing(false);
      }
    };
    checkToken();
  }, [getUserInfo]);

  React.useEffect(() => {
    return subscribeLanguageChanged(() => {
      const persistLanguageAsync = async () => {
        if (currentUserId == null) {
          return;
        }

        const authentication =
          await databaseAccessor.authentication.getAuthentication(
            currentUserId,
          );

        if (authentication == null) {
          return;
        }

        const selectedLanguage = getCurrentLanguage();

        await databaseAccessor.authentication.saveAuthentication({
          ...authentication,
          selectedLanguage,
        });

        await setUserInfo({
          userId: currentUserId,
          isAuthenticated: true,
          selectedLanguage,
        });
      };

      persistLanguageAsync().catch(error => {
        console.error(
          getResource('common.descriptionPersistAuthenticationFailed'),
          error,
        );
      });
    });
  }, [currentUserId, setUserInfo]);

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
