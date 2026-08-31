using Core.Web.ViewModels.Authentication;
using Microsoft.Extensions.DependencyInjection;

namespace Core.Web.ViewModels.DI
{
    public static class ViewModelRegistration
    {
        public static void AddViewModels(IServiceCollection services)
        {
            services.AddSingleton<LoginViewModel>();
        }
    }
}
