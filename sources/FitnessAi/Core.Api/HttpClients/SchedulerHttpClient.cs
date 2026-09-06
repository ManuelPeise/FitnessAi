using Shared.Interfaces.Http;

namespace Core.Api.HttpClients
{
    public class SchedulerHttpClient : IInternalHttpClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SchedulerHttpClient> _logger;

        public SchedulerHttpClient(HttpClient httpClient, ILogger<SchedulerHttpClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<HttpResponseMessage> PostAsync(
            Uri requestUri,
            HttpContent? content = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.PostAsync(
                    requestUri,
                    content,
                    cancellationToken);

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
    }

    
}
