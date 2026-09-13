using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IAiModelTrainerFactory
    {
        IAiModelTrainer GetTrainer(AiModelTypeEnum aiType);
    }
}
