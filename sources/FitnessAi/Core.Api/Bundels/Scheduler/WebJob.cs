using Quartz;
using Shared.Interfaces.Http;

namespace Core.Api.Bundels.Scheduler
{
    public sealed class WebJob : IJob
    {
        public string Url { get; set; } = default!;
        public Dictionary<string, object> Parameters { get; set; } = new();

        private readonly ILogger<WebJob> _logger;
        private readonly IInternalHttpClient _httpClient;

        public WebJob(ILogger<WebJob> logger, IInternalHttpClient httpClient)
        {
            _logger = logger;
            _httpClient = httpClient;
        }

        public async ValueTask Execute(
            IJobExecutionContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation(
                "Executing WebJob at {Time}",
                DateTimeOffset.UtcNow);

                var response = await _httpClient.PostAsync(Url, Parameters, null, cancellationToken);

                response.EnsureSuccessStatusCode();

                _logger.LogInformation(
                    "WebJob completed at {Time}",
                    DateTimeOffset.UtcNow);
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "An error occurred while executing the WebJob at {Time}",
                    DateTimeOffset.UtcNow);
                throw;
            }
        }
    }
}
