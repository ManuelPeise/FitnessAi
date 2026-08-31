using Shared.Interfaces.Http;
using System.Text.Json;

namespace Core.Web.Services.Http
{
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;

        public HttpClientService()
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5016/api/")
            };
        }

        public async Task<TResponseModel> SendPostRequest<TResponseModel, TRequestModel>(
            string url,
            TRequestModel model,
            Dictionary<string, object>? urlParameters,
            Dictionary<string, string>? headers,
            Dictionary<string, string>? authenticationHeaders) 
            where TRequestModel : class
            where TResponseModel : class
        {
            ArgumentNullException.ThrowIfNull(url);
            ArgumentNullException.ThrowIfNull(model);

            using var requestMessage = new HttpRequestMessage(
                HttpMethod.Post,
                url);

            requestMessage.Content = JsonContent.Create(model);

            if (headers != null)
            {
                foreach (var header in headers)
                {
                    requestMessage.Headers.TryAddWithoutValidation(
                        header.Key,
                        header.Value);
                }
            }

            if (authenticationHeaders != null)
            {
                foreach (var header in authenticationHeaders)
                {
                    requestMessage.Headers.TryAddWithoutValidation(
                        header.Key,
                        header.Value);
                }
            }

            var response = await _httpClient.SendAsync(requestMessage);

            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(content))
            {
                throw new InvalidOperationException(
                    "Response content is empty.");
            }

            return JsonSerializer.Deserialize<TResponseModel>(
                content,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                })
                ?? throw new InvalidOperationException(
                    "Failed to deserialize response content.");
        }
    }
}
