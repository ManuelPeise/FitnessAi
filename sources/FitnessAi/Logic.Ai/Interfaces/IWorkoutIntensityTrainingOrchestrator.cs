namespace Logic.Ai.Interfaces
{
    public interface IWorkoutIntensityTrainingOrchestrator
    {
        Task RunAsync(CancellationToken cancellationToken = default);
    }
}
