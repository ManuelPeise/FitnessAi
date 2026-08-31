using Data.Accessor.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Data.Accessor.DI
{
    public static class DataAccessorServiceRegistration
    {
        public static void AddDataAccessorServices(this IServiceCollection services)
        {
            services.AddScoped<IAiUnitOfWork, AIUnitOfWork>();
            services.AddScoped<IApplicationUnitOfWork, ApplicationUnitOfWork>();
        }
    }
}
