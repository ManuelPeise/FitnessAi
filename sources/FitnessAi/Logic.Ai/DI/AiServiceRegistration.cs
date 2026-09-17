using Logic.Ai.ColumnDefinitions;
using Logic.Ai.Csv;
using Logic.Ai.Interfaces;
using Logic.Ai.ModelMapper;
using Logic.Ai.Models;
using Logic.Ai.Prediction;
using Logic.Ai.Services;
using Logic.Ai.Training;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Ai.DI
{
    public static class AiServiceRegistration
    {
        public static void AddAiServices(this IServiceCollection services)
        {
            services.AddScoped<IColumnDefinitionFactory, ColumnDefinitionFactory>();
            services.AddScoped(typeof(ICsvModelLoader<>), typeof(CsvModelLoader<>));
            services.AddScoped(typeof(ICsvModelCreator<>), typeof(CsvModelCreator<>));
            services.AddScoped<IAiTrainingDataFileService, AiTrainingDataFileService>();
            services.AddScoped<ICsvRowMapper<WorkOutIntensityCsvModel>, WorkoutIntensityCsvRowMapper>();
            services.AddScoped<IWorkoutIntensityTrainingDataMapper, WorkoutIntensityCsvRowMapper>();
            services.AddScoped<IAiWorkOutIntensityTrainingFileService, AiWorkOutIntensityTrainingFileService>();
            services.AddScoped<IAiModelTrainer, TrainingIntensityAiModelTrainer>();
            services.AddScoped<IAiModelTrainerFactory, AiModelTrainerFactory>();
            services.AddScoped<IAiModelVersionStorageService, AiModelVersionStorageService>();
            services.AddScoped<IAiModelTrainingService, AiModelTrainingService>();
            services.AddScoped<IWorkoutIntensityPredictor, TrainingIntensityPredictor>();
            services.AddScoped<ITrainingIntensityPredictionService, TrainingIntensityPredictionService>();
        }
    }
}
