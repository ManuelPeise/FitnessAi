import React, { useState } from 'react';
import apiService, { ApiRequest } from '../lib/services/api/apiService';

const useApi = <TRequest, TResponse>(request: ApiRequest<TRequest>) => {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sendGetRequest = React.useCallback(
    async (options?: ApiRequest<TRequest>) => {
      setIsLoading(true);
      setError(null);

      const apiRequest = options ?? request;
      const result = await apiService.sendRequest<TRequest, TResponse>(
        apiRequest,
      );

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
      setIsLoading(false);
    },
    [request],
  );

  const sendPostRequest = React.useCallback(
    async (options?: ApiRequest<TRequest>) => {
      setIsLoading(true);
      setError(null);

      const apiRequest = options ?? request;
      const result = await apiService.sendRequest<TRequest, TResponse>(
        apiRequest,
      );

      if (result.error) {
        setError(result.error);
      }

      if (result.data) {
        setData(result.data);
      }
      setIsLoading(false);
    },
    [request],
  );

  React.useEffect(() => {
    sendGetRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, sendGetRequest, sendPostRequest, error, isLoading };
};

export default useApi;
