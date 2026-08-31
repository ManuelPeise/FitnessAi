using Data.Accessor.Interfaces;
using Data.Database.Entities.Ai;
using Data.Database.Entities.User;
using Logic.Parsing.CSV;
using Logic.Parsing.CSV.Enums;
using Logic.Services.Interfaces;
using Shared.Models.Running.Import;
using System.Linq.Expressions;

namespace Logic.Services.DataImport
{
    public class RunningDataImportService : IRunningDataImportService
    {
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public RunningDataImportService(
            IApplicationUnitOfWork applicationUnitOfWork,
            IAiUnitOfWork aiUnitOfWork)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task ImportRunningDataAsync(
            long userId,
            IReadOnlyList<string> csvContentRows,
            char delimiter,
            CancellationToken cancellationToken = default)
        {
            var userEntity = await _applicationUnitOfWork.UserRepository.GetByIdAsync(
                userId,
                true,
                new List<Expression<Func<UserEntity, object>>> { x => x.UserAiId },
                cancellationToken);

            if (userEntity == null)
            {
                // User not found, handle accordingly
                return;
            }

            var parser = CsvParserFactory<RunningDataImportModel>
                .CreateCsvParser(CsvTypeEnum.Running, new Dictionary<string, int>());

            var models = parser.ParseCsv(csvContentRows, delimiter);

            var entities = MapModelsToEntity(models, userEntity.UserAi.RunningTrainingDataGuid);

            await _aiUnitOfWork.RunningTrainingDataRepository.AddRangeAsync(entities, cancellationToken);

            await _aiUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private List<RunningTrainingDataEntity> MapModelsToEntity(IReadOnlyList<RunningDataImportModel> models, Guid runningTrainingDataGuid)
        {
            var entities = models.Select(model => new RunningTrainingDataEntity
            {
                RunningTrainingDataGuid = runningTrainingDataGuid,
                Date = model.Date,
                Age = model.Age,
                Distance = model.Distance,
                Duration = model.Duration,
                Gender = model.Gender,
                HeartRate = model.HeartRate,
                LossOfAltitude = model.LossOfAltitude,
                Pace = model.Pace,
                Performance = model.Performance,
                StepFrequence = model.StepFrequence,
                Weight = model.Weight,
                Vo2Max = model.Vo2Max,
                EffectAerob = model.EffectAerob,
                EffectAnaerob = model.EffectAnaerob,
                ElevationGain = model.ElevationGain,
                CaloriesBurned = model.CaloriesBurned
            }).ToList();

            return entities;
        }
    }
}
