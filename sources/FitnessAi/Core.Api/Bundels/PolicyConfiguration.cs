using System.Runtime.CompilerServices;

namespace Core.Api.Bundels
{
    public static class PolicyConfiguration
    {
        public const string CorsPolicy = "CorsPolicy";

        public static void ConfigurePolicies(this WebApplicationBuilder builder)
        {
            var configuration = builder.Configuration;
            var services = builder.Services;

            services.AddCors(options =>
            {
                var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();

                if (allowedOrigins == null || allowedOrigins.Length == 0)
                {
                    throw new InvalidOperationException("AllowedOrigins configuration is missing or empty.");
                }

                options.AddPolicy(name: CorsPolicy,
                    policy =>
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
            });
        }

        public static void UseAppCors(this WebApplication app)
        {
            app.UseCors(CorsPolicy);
        }
    }
}
