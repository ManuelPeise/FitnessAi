using Logic.Shared.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Shared.DI
{
    public static class SharedServiceRegistration
    {
        public static void AddSharedServices(this IServiceCollection services)
        {
            services.AddScoped<ICurrentUserService, CurrentUserService>();
        }
    }
}
