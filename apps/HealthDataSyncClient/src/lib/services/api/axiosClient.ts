import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { databaseAccessor } from '../../database/database';
import {
  secureStorage,
  SecureStorageKeys,
  UserInfo,
} from '../storage/secureStorage';

type RefreshTokenResponse = {
  token: string;
  refreshToken: string;
  tokenExpiresAt: string;
  appId: string;
};

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export const subscribeSessionExpired = (
  listener: SessionExpiredListener,
): (() => void) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};

const notifySessionExpired = () => {
  sessionExpiredListeners.forEach(listener => listener());
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
  timeout: 5 * 60 * 1000,
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
        notifySessionExpired();
        return null;
      }

      const response = await refreshClient.post<RefreshTokenResponse>(
        'UserAuthentication/RefreshToken',
        {
          refreshToken: authentication.refreshToken,
        },
      );

      const {
        token: accessToken,
        refreshToken: newRefreshToken,
        tokenExpiresAt,
      } = response.data;

      if (!accessToken || !newRefreshToken) {
        return null;
      }

      const currentAuthentication = {
        ...authentication,
        accessToken,
        refreshToken: newRefreshToken,
        tokenExpiration: tokenExpiresAt ?? authentication.tokenExpiration,
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
      notifySessionExpired();
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
