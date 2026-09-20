import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthenticationContextProps } from "../../types/authentication/AuthenticationContextProps";
import { UserProfileResponse } from "../../types/authentication/UserProfileResponse";
import { useApi } from "../../hooks/useApi";
import { apiClient } from "../api/axiosClient";
import { userAuthenticationAccessor } from "../database/userAuthenticationAccessor";
import { userDataAccessor } from "../database/userDataAccessor";
import DeviceInfo from "react-native-device-info";
import { TokenResponse } from "../../types/authentication/TokenResponse";

export const AuthenticationContext =
  React.createContext<AuthenticationContextProps | null>(null);

const fetchUserProfile = async (
  accessToken: string,
): Promise<UserProfileResponse> => {
  const response = await apiClient.get<UserProfileResponse>(
    "UserProfile/GetProfile",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};

const AuthenticationContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const authenticateApi = useApi<TokenResponse>({
    serviceUrl: "UserAuthentication/AuthenticateSyncClient",
  });

  useEffect(() => {
    userAuthenticationAccessor
      .getStoredAuthentication()
      .then((stored) => setIsAuthenticated(stored != null))
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const clientId = DeviceInfo.getModel();
      const tokenResponse = await authenticateApi.postAsync({
        body: { email, password, clientId },
      });

      if (!tokenResponse) {
        throw new Error("Login failed: no token received.");
      }

      const { token, refreshToken, tokenExpiresAt, scheduleSettings } =
        tokenResponse;

      console.log("Schedule Settings:", scheduleSettings);
      const profile = await fetchUserProfile(token);

      const localUser = await userDataAccessor.saveUserData({
        credentialsId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });

      await userAuthenticationAccessor.saveAuthentication({
        userId: localUser.id,
        jwt: token,
        refreshToken,
        expiresAt: tokenExpiresAt,
      });

      setIsAuthenticated(true);
    },
    [authenticateApi],
  );

  const logout = useCallback(async () => {
    const storedAuthentication =
      await userAuthenticationAccessor.getStoredAuthentication();

    if (storedAuthentication) {
      await userAuthenticationAccessor.clearAuthentication(
        storedAuthentication.userId,
      );
    }
    setIsAuthenticated(false);
  }, []);

  const contextValue: AuthenticationContextProps = useMemo(
    () => ({ isAuthenticated, isInitializing, login, logout }),
    [isAuthenticated, isInitializing, login, logout],
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationContextProvider;
