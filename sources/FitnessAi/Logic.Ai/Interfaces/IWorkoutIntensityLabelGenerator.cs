namespace Logic.Ai.Interfaces
{
    public interface IWorkoutIntensityLabelGenerator
    {
        Task<int> BackfillLabelsAsync(long? userId = null, CancellationToken cancellationToken = default);
    }
}
