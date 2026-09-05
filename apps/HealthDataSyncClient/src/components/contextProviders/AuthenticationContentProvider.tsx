import React from 'react';
import {
  secureStorage,
  SecureStorageKeys,
} from '../../lib/services/storage/secureStorage';
import { apiClient } from '../../lib/services/api/axiosClient';
import { databaseAccessor } from '../../lib/database/database';
import { ApiAuthenticationTableEntry } from '../../lib/database/databaseTypes';

type LoginRequest = {
  email: string;
  password: string;
};

type AuthenticationContextResult = {
  isAuthenticated: boolean;
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
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const getTokens = React.useCallback(async () => {
    const token = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
    const refreshToken = await secureStorage.getItem(
      SecureStorageKeys.REFRESH_TOKEN,
    );
    return !!token && !!refreshToken;
  }, []);

  const handleLogin = async (request: LoginRequest) => {
    setIsLoading(true);
    console.log('Login request:', request);
    try {
      const response = await apiClient.post('/login', request);

      if (response && response.status === 200 && response.data) {
        const { token, refreshToken, tokenExpiration, appId } = response.data;
        const authentication =
          await databaseAccessor.authentication.getAuthentication();

        if (authentication == null) {
          const authenticationEntry: ApiAuthenticationTableEntry = {
            id: -1,
            accessToken: token,
            refreshToken: refreshToken,
            tokenExpiration: tokenExpiration,
            appKey: appId,
            created_at: null,
            updated_at: null,
          };

          databaseAccessor.authentication.saveAuthentication(
            authenticationEntry,
          );
        } else {
          const updatedAuthenticationEntry: ApiAuthenticationTableEntry = {
            ...authentication,
            accessToken: token,
            refreshToken: refreshToken,
            tokenExpiration: tokenExpiration,
            appKey: appId,
            updated_at: null,
          };

          databaseAccessor.authentication.saveAuthentication(
            updatedAuthenticationEntry,
          );
        }

        await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, 'token');
        await secureStorage.setItem(
          SecureStorageKeys.REFRESH_TOKEN,
          'refreshToken',
        );

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
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const checkToken = async () => {
      setIsInitializing(true);

      const tokenExists = await getTokens();
      setIsAuthenticated(tokenExists);

      setIsInitializing(false);
    };
    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated,
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
