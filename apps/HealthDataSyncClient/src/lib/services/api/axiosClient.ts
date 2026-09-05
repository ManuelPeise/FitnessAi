import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { databaseAccessor } from '../../database/database';
import {
  secureStorage,
  SecureStorageKeys,
  UserInfo,
} from '../storage/secureStorage';

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};

const normalizeBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

const getApiBaseUrl = (): string => {
  const runtimeApiConfig = globalThis as typeof globalThis & {
    FITNESSAI_API_BASE_URL?: string;
  };
  const configuredApiBaseUrl = runtimeApiConfig.FITNESSAI_API_BASE_URL;

  if (
    typeof configuredApiBaseUrl === 'string' &&
    configuredApiBaseUrl.trim().length > 0
  ) {
    return normalizeBaseUrl(configuredApiBaseUrl.trim());
  }

  return 'http://localhost:8080/api/';
};

const ApiBaseUrl = getApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: ApiBaseUrl,
  timeout: 30_000,
  fetchOptions: {
    mode: 'cors',
    keepalive: true,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: ApiBaseUrl,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const getCurrentUserId = async (): Promise<number | null> => {
  const serializedUserInfo = await secureStorage.getItem(
    SecureStorageKeys.USER_INFO,
  );

  if (!serializedUserInfo) {
    return null;
  }

  let userInfo: UserInfo;

  try {
    userInfo = JSON.parse(serializedUserInfo) as UserInfo;
  } catch {
    return null;
  }

  if (
    userInfo == null ||
    !userInfo.isAuthenticated ||
    userInfo.userId == null ||
    !Number.isInteger(userInfo.userId) ||
    userInfo.userId <= 0
  ) {
    return null;
  }

  return userInfo.userId;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const userId = await getCurrentUserId();
    if (userId == null) {
      return null;
    }

    const authentication =
      await databaseAccessor.authentication.getAuthentication(userId);

    if (!authentication) {
      return null;
    }

    try {
      if (!authentication.refreshToken) {
        return null;
      }

      const response = await refreshClient.post<RefreshTokenResponse>(
        '/auth/refresh',
        {
          refreshToken: authentication.refreshToken,
        },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      if (!accessToken || !newRefreshToken) {
        return null;
      }

      const currentAuthentication = {
        ...authentication,
        accessToken,
        refreshToken: newRefreshToken ?? null,
      };

      await databaseAccessor.authentication.saveAuthentication(
        currentAuthentication,
      );

      return accessToken;
    } catch {
      const currentAuthenticationEntry = {
        ...authentication,
        accessToken: null,
        refreshToken: null,
        tokenExpiration: null,
      };

      await databaseAccessor.authentication.saveAuthentication(
        currentAuthenticationEntry,
      );
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const userId = await getCurrentUserId();
    if (userId == null) {
      return config;
    }

    const authentication =
      await databaseAccessor.authentication.getAuthentication(userId);

    if (authentication?.accessToken) {
      config.headers.Authorization = `Bearer ${authentication.accessToken}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const token = await refreshAccessToken();

    if (token && error.config && !error.config._retry) {
      error.config._retry = true;
      error.config.headers.Authorization = `Bearer ${token}`;
      return apiClient(error.config);
    }

    return Promise.reject(error);
  },
);
