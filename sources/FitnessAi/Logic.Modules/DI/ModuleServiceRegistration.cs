using Logic.Modules.HealthConnect;
using Logic.Modules.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Modules.DI
{
    public static class ModuleServiceRegistration
    {
        public static void RegisterModuleServices(this IServiceCollection services)
        {
            services.AddScoped<IHealthConnectConfiguration, HealthConnectConfiguration>();
        }
    }
}
