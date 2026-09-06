using Shared.Interfaces.Http;

namespace Core.Api.HttpClients
{
    public class InternalHttpClient : IInternalHttpClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<InternalHttpClient> _logger;

        public InternalHttpClient(HttpClient httpClient, ILogger<InternalHttpClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<HttpResponseMessage> PostAsync(
            string requestUri,
            Dictionary<string, object>? parameters = null,
            HttpContent? content = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var requestUriWithParameters = BuildRequestUri(requestUri, parameters);

                var requestMessage = new HttpRequestMessage
                {
                    RequestUri = new Uri(requestUriWithParameters, UriKind.Relative),
                    Method = HttpMethod.Post,
                    Content = content,
                };

                var response = await _httpClient.SendAsync(
                    requestMessage, cancellationToken);

                return response;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while sending the HTTP POST request to {RequestUri}.",
                    requestUri);

                throw;
            }
        }

        private string BuildRequestUri(string requestUri, Dictionary<string, object>? parameters)
        {
            if (parameters == null || !parameters.Any())
            {
                return requestUri;
            }

            var query = string.Join(
                "&",
                parameters.Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value.ToString() ?? string.Empty)}"));


            return $"{requestUri}?{query}";
        }
    }
}
