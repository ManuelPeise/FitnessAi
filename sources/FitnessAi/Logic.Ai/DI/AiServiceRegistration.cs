using Logic.Ai.Interfaces;
using Logic.Ai.Training;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Ai.DI
{
    public static class AiServiceRegistration
    {
        public static void AddAiServices(this IServiceCollection services)
        {
            services.AddScoped<IAiTrainingDataBuilder, AiTrainingDataBuilder>();
        }
    }
}
