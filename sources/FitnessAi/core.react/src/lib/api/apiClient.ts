import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  hasRetriedAfterRefresh?: boolean;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const refreshPath = import.meta.env.VITE_API_REFRESH_PATH ?? "/auth/refresh";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshRequest: Promise<string> | null = null;

const client = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const setAuthTokens = (tokens: AuthTokens): void => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken ?? null;
};

export const clearAuthTokens = (): void => {
  accessToken = null;
  refreshToken = null;
};

const refreshAccessToken = async (): Promise<string> => {
  const response = await refreshClient.post<AuthTokens>(
    refreshPath,
    refreshToken === null ? undefined : { refreshToken },
  );

  setAuthTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken ?? refreshToken ?? undefined,
  });

  return response.data.accessToken;
};

client.interceptors.request.use((config) => {
  if (accessToken !== null) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      originalRequest === undefined ||
      originalRequest.hasRetriedAfterRefresh ||
      originalRequest.url === refreshPath
    ) {
      return Promise.reject(error);
    }

    originalRequest.hasRetriedAfterRefresh = true;

    try {
      refreshRequest ??= refreshAccessToken().finally(() => {
        refreshRequest = null;
      });

      const refreshedAccessToken = await refreshRequest;
      originalRequest.headers.set(
        "Authorization",
        `Bearer ${refreshedAccessToken}`,
      );

      return client.request(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  },
);

export const apiClient = {
  async get<Response>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Response> {
    const response = await client.get<Response>(url, config);
    return response.data;
  },

  async post<Response, Body = undefined>(
    url: string,
    body?: Body,
    config?: AxiosRequestConfig,
  ): Promise<Response> {
    const response = await client.post<Response>(url, body, config);
    return response.data;
  },
};
