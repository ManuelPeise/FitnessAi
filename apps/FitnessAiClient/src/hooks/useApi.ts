import React from 'react';
import { apiClient } from '../lib/api/axiosClient';

type UseApiOptions = {
  serviceUrl: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
  fireOnMount?: boolean;
  persistResponse?: boolean;
};

type UseApiResult<TModel = any> = {
  data: TModel | null;
  loading: boolean;
  error: unknown | null;
  getAsync: (options?: Partial<UseApiOptions>) => Promise<TModel | null>;
  postAsync: (options?: Partial<UseApiOptions>) => Promise<TModel | null>;
};

export const useApi = <TModel = any>(
  options: UseApiOptions,
): UseApiResult<TModel> => {
  const optionsRef = React.useRef<UseApiOptions>(options);
  optionsRef.current = options;
  // Keep a ref to the latest options to avoid stale closures in callbacks
  const [data, setData] = React.useState<TModel | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<unknown | null>(null);

  const getAsync = React.useCallback(
    async (callOptions?: Partial<UseApiOptions>): Promise<TModel | null> => {
      setLoading(true);
      setError(null);

      try {
        const requestOptions = { ...optionsRef.current, ...callOptions };
        const response = await apiClient.get<TModel>(
          requestOptions.serviceUrl,
          { params: requestOptions.params },
        );
        if (requestOptions.persistResponse) {
          setData(response.data);
        }
        return response.data;
      } catch (requestError) {
        setError(requestError);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const postAsync = React.useCallback(
    async (callOptions?: Partial<UseApiOptions>): Promise<TModel | null> => {
      setLoading(true);
      setError(null);

      try {
        const requestOptions = { ...optionsRef.current, ...callOptions };
        const response = await apiClient.post<TModel>(
          requestOptions.serviceUrl,
          requestOptions.body,
          { params: requestOptions.params },
        );
        if (requestOptions.persistResponse) {
          setData(response.data);
        }
        return response.data;
      } catch (requestError) {
        setError(requestError);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (optionsRef.current.fireOnMount) {
      getAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    getAsync,
    postAsync,
  };
};
