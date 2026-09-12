using Logic.Ai.Csv;
using Logic.Ai.Csv.ModelMapper;
using Logic.Ai.Csv.Models;
using Logic.Ai.Csv.Services;
using Logic.Ai.Interfaces;
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
        }
    }
}
