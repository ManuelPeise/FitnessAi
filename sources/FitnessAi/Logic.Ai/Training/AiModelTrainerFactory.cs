using Logic.Ai.Interfaces;
using Shared.Enums.Ai;

namespace Logic.Ai.Training
{
    public class AiModelTrainerFactory : IAiModelTrainerFactory
    {
        private readonly IReadOnlyDictionary<AiModelTypeEnum, IAiModelTrainer> _trainers;

        public AiModelTrainerFactory(IEnumerable<IAiModelTrainer> trainers)
        {
            _trainers = trainers.ToDictionary(trainer => trainer.AiType);
        }

        public IAiModelTrainer GetTrainer(AiModelTypeEnum aiType)
        {
            if (!_trainers.TryGetValue(aiType, out var trainer))
            {
                throw new InvalidOperationException($"No AI model trainer registered for AiType '{aiType}'.");
            }

            return trainer;
        }
    }
}
