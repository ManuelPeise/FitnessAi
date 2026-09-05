import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { databaseAccessor } from '../../database/database';
import {
  secureStorage,
  SecureStorageKeys,
} from '../storage/secureStorage';

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};

const ApiBaseUrl = 'https://localhost:7293/api/';

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
  const storedUserId = await secureStorage.getItem(
    SecureStorageKeys.CURRENT_USER_ID,
  );
  const parsedUserId = Number(storedUserId);

  if (!storedUserId || !Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  return parsedUserId;
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

      await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, accessToken);
      await secureStorage.setItem(
        SecureStorageKeys.REFRESH_TOKEN,
        newRefreshToken,
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

      await secureStorage.removeItem(SecureStorageKeys.ACCESS_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
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
