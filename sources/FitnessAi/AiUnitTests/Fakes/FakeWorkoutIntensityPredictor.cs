using Logic.Ai.Interfaces;
using Shared.Enums.Ai;
using Shared.Models.Ai.InputModels;

namespace AiUnitTests.Fakes
{
    internal class FakeWorkoutIntensityPredictor : IWorkoutIntensityPredictor
    {
        public WorkoutIntensityEnum? Result { get; set; } = WorkoutIntensityEnum.Medium;
        public List<WorkoutIntensityMlInputModel> Inputs { get; } = [];

        public Task<WorkoutIntensityEnum?> PredictAsync(WorkoutIntensityMlInputModel input, string? modelVersion, CancellationToken cancellationToken = default)
        {
            Inputs.Add(input);
            return Task.FromResult(Result);
        }
    }
}
