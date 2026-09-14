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

type UseApiResult<TModel> = ApiState<TModel> & {
  get: (endpoint: string, config?: AxiosRequestConfig) => Promise<TModel>;
  post: <Body = undefined>(
    endpoint: string,
    body?: Body,
    config?: AxiosRequestConfig,
  ) => Promise<TModel>;
};

export type InitialApiRequest = {
  endpoint: string;
  method: "get" | "post";
  config?: AxiosRequestConfig;
};

export const useApi = <TModel>(
  initialRequest?: InitialApiRequest,
): UseApiResult<TModel> => {
  const [state, dispatch] = React.useReducer(
    apiReducer<TModel>,
    initialApiState<TModel>(),
  );
  const initialRequestRef = React.useRef(initialRequest);
  const hasInitializedRef = React.useRef(false);

  const executeRequest = React.useCallback(
    async (
      endpoint: string,
      request: () => Promise<TModel>,
    ): Promise<TModel> => {
      dispatch({ type: "request", endpoint });

      try {
        const response = await request();
        dispatch({ type: "success", endpoint, response });
        return response;
      } catch (error: unknown) {
        dispatch({ type: "failure", endpoint, error });
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

    if (hasInitializedRef.current || request?.method !== "get") {
      return;
    }

    hasInitializedRef.current = true;
    void get(request.endpoint, request.config).catch(() => undefined);
  }, [get]);

  return React.useMemo(() => ({ ...state, get, post }), [state, get, post]);
};
