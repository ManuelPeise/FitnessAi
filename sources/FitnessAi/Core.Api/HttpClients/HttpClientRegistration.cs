using Logic.Shared.Handlers;
using Shared.Interfaces.Http;

namespace Core.Api.HttpClients
{
    public static class HttpClientRegistration
    {
        public static void RegisterHttpClients(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddTransient<MaintenanceAuthenticationHandler>();
            services.AddHttpClient<IInternalHttpClient, SchedulerHttpClient>(client =>
            {
                client.BaseAddress = GetBaseUrl(configuration);
            }).AddHttpMessageHandler<MaintenanceAuthenticationHandler>();
        }

        private static Uri GetBaseUrl(IConfiguration configuration)
        {
            var webJobBaseUrlString = configuration["WebJobBaseAddress"] ?? string.Empty;

            if (string.IsNullOrEmpty(webJobBaseUrlString))
            {
                throw new InvalidOperationException("WebJobBaseAddress configuration is missing.");
            }

            return new Uri(webJobBaseUrlString);
        }
    }
}
