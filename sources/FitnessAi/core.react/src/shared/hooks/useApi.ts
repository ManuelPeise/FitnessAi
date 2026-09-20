import React from "react";
import type { AxiosRequestConfig } from "axios";
import { apiClient } from "../../lib/api";

type ApiState<TModel> = {
  endpoint?: string;
  response?: TModel;
  responses: Record<string, TModel>;
  isLoading: boolean;
  error?: unknown;
};

type ApiAction<TModel> =
  | { type: "request"; endpoint: string }
  | { type: "success"; endpoint: string; response: TModel }
  | { type: "failure"; endpoint: string; error: unknown };

const apiReducer = <TModel>(
  state: ApiState<TModel>,
  action: ApiAction<TModel>,
): ApiState<TModel> => {
  switch (action.type) {
    case "request":
      return {
        ...state,
        endpoint: action.endpoint,
        isLoading: true,
        error: undefined,
      };
    case "success":
      return {
        ...state,
        endpoint: action.endpoint,
        response: action.response,
        responses: {
          ...state.responses,
          [action.endpoint]: action.response,
        },
        isLoading: false,
        error: undefined,
      };
    case "failure":
      return {
        ...state,
        endpoint: action.endpoint,
        isLoading: false,
        error: action.error,
      };
  }
};

const initialApiState = <TModel>(): ApiState<TModel> => ({
  responses: {},
  isLoading: false,
});

export type UseApiResult<TModel> = ApiState<TModel> & {
  get: (endpoint: string, config?: AxiosRequestConfig) => Promise<TModel>;
  post: <Body = undefined>(
    endpoint: string,
    body?: Body,
    config?: AxiosRequestConfig,
  ) => Promise<TModel>;
  error: string | null;
  isLoading: boolean;
};

export type InitialApiRequest = {
  endpoint: string;
  method: "GET" | "POST";
  config?: AxiosRequestConfig;
};

export const useApi = <TModel>(
  initialRequest?: InitialApiRequest,
): UseApiResult<TModel> => {
  const [state, dispatch] = React.useReducer(
    apiReducer<TModel>,
    initialApiState<TModel>(),
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialRequestRef = React.useRef(initialRequest);
  const hasInitializedRef = React.useRef(false);

  const executeRequest = React.useCallback(
    async (
      endpoint: string,
      request: () => Promise<TModel>,
    ): Promise<TModel> => {
      dispatch({ type: "request", endpoint });
      setIsLoading(true);

      try {
        const response = await request();
        dispatch({ type: "success", endpoint, response });
        setIsLoading(false);
        return response;
      } catch (error: unknown) {
        dispatch({ type: "failure", endpoint, error });
        setIsLoading(false);
        setError(error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    [],
  );

  const get = React.useCallback(
    (endpoint: string, config?: AxiosRequestConfig): Promise<TModel> =>
      executeRequest(endpoint, () => apiClient.get<TModel>(endpoint, config)),
    [executeRequest],
  );

  const post = React.useCallback(
    <Body = undefined>(
      endpoint: string,
      body?: Body,
      config?: AxiosRequestConfig,
    ): Promise<TModel> =>
      executeRequest(endpoint, () =>
        apiClient.post<TModel, Body>(endpoint, body, config),
      ),
    [executeRequest],
  );

  React.useEffect(() => {
    const request = initialRequestRef.current;

    if (hasInitializedRef.current || request?.method !== "GET") {
      return;
    }

    hasInitializedRef.current = true;
    void get(request.endpoint, request.config).catch(() => undefined);
  }, [get]);

  return React.useMemo(
    () => ({
      ...state,
      isLoading,
      error: error,
      get,
      post,
    }),
    [state, get, post],
  );
};
