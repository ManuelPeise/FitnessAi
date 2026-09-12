using Data.Database.Entities.Ai;
using Logic.Ai.Training.Models;

namespace Logic.Ai.Interfaces
{
    public interface IModelTrainingDataConverter
    {
        IReadOnlyList<GlobalAiTrainingDataModel> ConvertForGlobalModel(IReadOnlyList<HealthConnectAiTrainingDataEntity> trainingData);

        IReadOnlyList<UserAiTrainingDataModel> ConvertForUserModel(IReadOnlyList<HealthConnectAiTrainingDataEntity> trainingData);
    }
}
