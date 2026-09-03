import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { secureStorage, SecureStorageKeys } from '../storage/secureStorage';

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken?: string;
};

const ApiBaseUrl = 'http://localhost:5016/api/';

export const apiClient: AxiosInstance = axios.create({
  baseURL: ApiBaseUrl,
  timeout: 30_000,
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

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await secureStorage.getItem(
        SecureStorageKeys.REFRESH_TOKEN,
      );

      if (!refreshToken) {
        return null;
      }

      const response = await refreshClient.post<RefreshTokenResponse>(
        '/auth/refresh',
        {
          refreshToken,
        },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, accessToken);

      if (newRefreshToken) {
        await secureStorage.setItem(
          SecureStorageKeys.REFRESH_TOKEN,
          newRefreshToken,
        );
      }

      return accessToken;
    } catch {
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
    const accessToken = await secureStorage.getItem(
      SecureStorageKeys.ACCESS_TOKEN,
    );

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

    const accessToken = await refreshAccessToken();

    // Retry the original request with the new access token
    if (accessToken && error.config && !error.config._retry) {
      error.config._retry = true;
      error.config.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(error.config);
    }

    return Promise.reject(error);
  },
);
