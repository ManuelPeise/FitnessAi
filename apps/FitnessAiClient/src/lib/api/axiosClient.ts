import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { normalizeBaseUrl } from '../utils/appUtils';
import { userAuthenticationAccessor } from '../database/userAuthenticationAccessor';
import { RefreshTokenResponse } from '../../types/authentication/RefreshTokenResponse';
import { SessionExpiredListener } from '../../types/authentication/SessionExpiredListener';

const DefaultApiBaseUrl = 'http://localhost:8080/api/';

const getApiBaseUrl = (): string => {
  const runtimeConfig = globalThis as typeof globalThis & {
    FITNESSAI_API_BASE_URL?: string;
  };
  const configuredBaseUrl = runtimeConfig.FITNESSAI_API_BASE_URL?.trim();

  return configuredBaseUrl
    ? normalizeBaseUrl(configuredBaseUrl)
    : DefaultApiBaseUrl;
};

const apiBaseUrl = getApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

const sessionExpiredListeners = new Set<SessionExpiredListener>();

export const subscribeSessionExpired = (
  listener: SessionExpiredListener,
): (() => void) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};

const notifySessionExpired = (): void => {
  sessionExpiredListeners.forEach(listener => listener());
};

const requestTokenRefresh = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  const response = await refreshClient.post<RefreshTokenResponse>(
    'UserAuthentication/RefreshToken',
    { refreshToken },
  );
  return response.data;
};

const performTokenRefresh = async (): Promise<string | null> => {
  const storedAuthentication =
    await userAuthenticationAccessor.getStoredAuthentication();

  if (!storedAuthentication?.refreshToken) {
    notifySessionExpired();
    return null;
  }

  try {
    const { token, refreshToken, tokenExpiresAt } = await requestTokenRefresh(
      storedAuthentication.refreshToken,
    );

    if (!token || !refreshToken) {
      notifySessionExpired();
      return null;
    }

    await userAuthenticationAccessor.saveAuthentication({
      userId: storedAuthentication.userId,
      jwt: token,
      refreshToken,
      expiresAt: tokenExpiresAt,
    });

    return token;
  } catch {
    await userAuthenticationAccessor.clearAuthentication(
      storedAuthentication.userId,
    );
    notifySessionExpired();
    return null;
  }
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  refreshPromise ??= performTokenRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const storedAuthentication =
      await userAuthenticationAccessor.getStoredAuthentication();

    if (storedAuthentication?.jwt) {
      config.headers.Authorization = `Bearer ${storedAuthentication.jwt}`;
    }
    return config;
  },
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status !== 401 || error.config?._retry) {
      return Promise.reject(error);
    }

    const accessToken = await refreshAccessToken();

    if (!accessToken) {
      return Promise.reject(error);
    }

    error.config._retry = true;
    error.config.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(error.config);
  },
);
