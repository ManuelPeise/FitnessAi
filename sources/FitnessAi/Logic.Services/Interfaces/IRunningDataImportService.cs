namespace Logic.Services.Interfaces
{
    public interface IRunningDataImportService
    {
        Task ImportRunningDataAsync(
        long userId,
        IReadOnlyList<string> csvContentRows,
        char delimiter,
        CancellationToken cancellationToken = default);
    }
}
