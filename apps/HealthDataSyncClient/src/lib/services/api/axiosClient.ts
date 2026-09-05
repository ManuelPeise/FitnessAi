import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { databaseAccessor } from '../../database/database';

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

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const authentication =
      await databaseAccessor.authentication.getAuthentication();

    if (!authentication) {
      return null;
    }

    try {
      if (!authentication?.refreshToken) {
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
    const authentication =
      await databaseAccessor.authentication.getAuthentication();

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

    // Retry the original request with the new access token
    if (token && error.config && !error.config._retry) {
      error.config._retry = true;
      error.config.headers.Authorization = `Bearer ${token}`;
      return apiClient(error.config);
    }

    return Promise.reject(error);
  },
);
