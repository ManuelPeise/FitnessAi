using Logic.Services.Authentication;
using Logic.Services.DataImport;
using Logic.Services.Interfaces;
using Logic.Services.Scheduler;
using Logic.Services.Seed;
using Microsoft.Extensions.DependencyInjection;
using Shared.Interfaces.Authentication;

namespace Logic.Services.DI
{
    public static class ServiceRegistration
    {
        public static void AddLogicServices(this IServiceCollection services)
        {
            services.AddScoped<IUserSeedService, UserSeedService>();
            services.AddScoped<IHealthDataImport, HealthDataImport>();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IScheduledJobService, ScheduledJobService>();
            services.AddScoped<IScheduledTaskService, ScheduledTaskService>();
        }
    }
}
