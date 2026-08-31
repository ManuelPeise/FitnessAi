using Logic.Services.Authentication;
using Logic.Services.DataImport;
using Logic.Services.Interfaces;
using Logic.Services.Seed;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Services.DI
{
    public static class ServiceRegistration
    {
        public static void AddLogicServices(this IServiceCollection services)
        {
            services.AddScoped<IUserSeedService, UserSeedService>();
            services.AddScoped<IRunningDataImportService, RunningDataImportService>();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
        }
    }
}
