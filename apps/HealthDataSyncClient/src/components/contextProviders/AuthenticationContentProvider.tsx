import React from 'react';
import {
  secureStorage,
  SecureStorageKeys,
} from '../../lib/services/storage/secureStorage';

type LoginRequest = {
  email: string;
  password: string;
};

// type TokenResponse = {
//   token: string;
//   refreshToken: string;
// };

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
      // const response = await apiClient.sendRequest<LoginRequest, TokenResponse>(
      //   {
      //     serviceUrl: '/login',
      //     method: 'POST',
      //     body: request,
      //   },
      // );

      // if (response.data) {
      //   const { token, refreshToken } = response.data;

      await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, 'token');
      await secureStorage.setItem(
        SecureStorageKeys.REFRESH_TOKEN,
        'refreshToken',
      );

      setIsAuthenticated(true);
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
