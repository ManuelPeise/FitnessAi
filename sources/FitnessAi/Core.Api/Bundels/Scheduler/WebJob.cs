using Quartz;
using Shared.Interfaces.Http;

namespace Core.Api.Bundels.Scheduler
{
    public sealed class WebJob : IJob
    {
        public Uri Url { get; set; } = default!;
        public long FireTime { get; set; } = default!;

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

                var response = await _httpClient.PostAsync(Url);

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
