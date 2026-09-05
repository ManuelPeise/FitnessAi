export type ApiResult<TResponse> = {
  data: TResponse;
  error?: string;
};

export type ApiRequest<TRequest> = {
  serviceUrl: string;
  method: 'GET' | 'POST';
  urlParams?: Record<string, string>;
  body?: TRequest;
};

const apiService = {
  sendRequest: async <TRequest, TResponse>(
    config: ApiRequest<TRequest>,
  ): Promise<ApiResult<TResponse>> => {
    const { serviceUrl, method, urlParams, body } = config;
    const url = new URL(serviceUrl);

    if (urlParams) {
      Object.entries(urlParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const result: ApiResult<TResponse> = {
      data: null as any,
    };

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as TResponse;
      result.data = data;
    } catch (error: any) {
      result.error = error.message;
    }
    return result;
  },
};

export default apiService;
