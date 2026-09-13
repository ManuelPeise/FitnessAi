using Data.Database.Entities.HealthConnect;
using Logic.Ai.Models;

namespace Logic.Ai.Interfaces
{
    // Entity -> CSV model mapping is separate from ICsvRowMapper<T> (which only handles
    // CSV row <-> model): the generic CSV infra has no notion of HealthConnectTrainingDataEntity.
    public interface IWorkoutIntensityTrainingDataMapper
    {
        WorkOutIntensityCsvModel? MapFromTrainingData(HealthConnectTrainingDataEntity entity);
    }
}
