using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Logic.Ai.Training.Models;
using System.Linq;

namespace Logic.Ai.Training.ModelTrainers
{
    public class ModelTrainingDataConverter : IModelTrainingDataConverter
    {
        public IReadOnlyList<GlobalAiTrainingDataModel> ConvertForGlobalModel(IReadOnlyList<HealthConnectAiTrainingDataEntity> trainingData)
        {
            return trainingData.Select(entity =>
            {
                var model = new GlobalAiTrainingDataModel { UserId = entity.UserId };
                MapCommonFields(model, entity);
                return model;
            }).ToList();
        }

        public IReadOnlyList<UserAiTrainingDataModel> ConvertForUserModel(IReadOnlyList<HealthConnectAiTrainingDataEntity> trainingData)
        {
            return trainingData.Select(entity =>
            {
                var model = new UserAiTrainingDataModel();
                MapCommonFields(model, entity);
                return model;
            }).ToList();
        }

        private void MapCommonFields(AiTrainingDataModelBase model, HealthConnectAiTrainingDataEntity entity)
        {
            model.ExerciseType = entity.ExerciseType.ToString();
            model.CaloriesBurned = entity.CaloriesBurned ?? 0;
            model.Steps = entity.Steps ?? 0;
            model.DurationSeconds = (float)(entity.DurationSeconds ?? 0);
            model.DurationSecondsPerKm = (float)(entity.DurationSecondsPerKm ?? 0);
            model.DistanceInMeters = (float)(entity.DistanceInMeters ?? 0);
            model.ElevationMetersAvg = entity.EvaluationMetersAvg ?? 0;
            model.Weight = (float)(entity.Weight ?? 0);
            model.BodyFatPercentage = (float)(entity.BodyFatPercentage ?? 0);
            model.BodyMassIndex = (float)(entity.BodyMassIndex ?? 0);
            model.OxygenSaturationPercentageAvg = (float)(entity.OxygenSaturationPercentageAvg ?? 0);
            model.RespiratoryRateAvg = (float)(entity.RespiratoryRateAvg ?? 0);
            model.Vo2MaxMlPerMinKgAvg = (float)(entity.Vo2MaxMlPerMinKgAvg ?? 0);
            model.LapCount = entity.Laps.Count;
            model.AvgLapDurationSeconds = Average(entity.Laps.Select(lap => (float)lap.DurationSeconds));
            model.AvgLapLengthMeters = Average(entity.Laps.Select(lap => (float)lap.LengthInMeters));
            model.SegmentCount = entity.Segments.Count;
            model.AvgSegmentDurationSeconds = Average(entity.Segments.Select(segment => (float)segment.DurationSeconds));
        }

        private float Average(IEnumerable<float> values)
        {
            var list = values.ToList();

            if (list.Count == 0)
            {
                return 0f;
            }

            return list.Average();
        }
    }
}
