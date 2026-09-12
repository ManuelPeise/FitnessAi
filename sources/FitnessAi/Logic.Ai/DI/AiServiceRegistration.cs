using Logic.Ai.Interfaces;
using Logic.Ai.Training;
using Logic.Ai.Training.ModelTrainers;
using Logic.Ai.Training.WorkoutIntensity;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Ai.DI
{
    public static class AiServiceRegistration
    {
        public static void AddAiServices(this IServiceCollection services)
        {
            services.AddScoped<IAiTrainingDataBuilder, AiTrainingDataBuilder>();
            services.AddScoped<IModelTrainingDataLoader, ModelTrainingDataLoader>();
            services.AddScoped<IModelTrainingDataConverter, ModelTrainingDataConverter>();
            services.AddScoped<IAiModelLifecycleService, AiModelLifecycleService>();
            services.AddScoped<IAiModelTrainer, AiModelTrainer>();
            services.AddScoped<IWorkoutIntensityLabelGenerator, WorkoutIntensityLabelGenerator>();
            services.AddScoped<IWorkoutIntensityMlModelBuilder, WorkoutIntensityMlModelBuilder>();
            services.AddScoped<IWorkoutIntensityModelTrainer, WorkoutIntensityModelTrainer>();
            services.AddScoped<IWorkoutIntensityPredictor, WorkoutIntensityPredictor>();
            services.AddScoped<IWorkoutIntensityTrainingOrchestrator, WorkoutIntensityTrainingOrchestrator>();
        }
    }
}
