import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  hasRetriedAfterRefresh?: boolean;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const refreshPath = import.meta.env.VITE_API_REFRESH_PATH ?? "/auth/refresh";
const authPaths = [
  refreshPath,
  import.meta.env.VITE_API_LOGIN_PATH ?? "/auth/login",
  import.meta.env.VITE_API_LOGOUT_PATH ?? "/auth/logout",
];

let refreshRequest: Promise<void> | null = null;
let unauthorizedHandler: (() => void) | null = null;

const client = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

const refreshSession = async (): Promise<void> => {
  await refreshClient.post(refreshPath);
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      originalRequest === undefined ||
      originalRequest.hasRetriedAfterRefresh ||
      authPaths.includes(originalRequest.url ?? "")
    ) {
      return Promise.reject(error);
    }

    originalRequest.hasRetriedAfterRefresh = true;

    try {
      refreshRequest ??= refreshSession().finally(() => {
        refreshRequest = null;
      });

      await refreshRequest;

      return client.request(originalRequest);
    } catch (refreshError) {
      unauthorizedHandler?.();
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
