using Logic.Ai.Models;
using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    // One implementation per AiModelTypeEnum that needs in-process training - resolved via
    // IAiModelTrainerFactory. Returns null when there isn't enough labeled data to train yet.
    public interface IAiModelTrainer
    {
        AiModelTypeEnum AiType { get; }
        AiModelTrainingResult? Train(byte[] csvData);
    }
}
