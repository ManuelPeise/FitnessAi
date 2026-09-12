namespace Logic.Ai.Interfaces
{
    public interface IAiWorkOutIntensityTrainingFileService
    {
        Task<byte[]> LoadInitialWorkOutIntensityTrainingCsvAsync(int itemsCount, CancellationToken cancellationToken = default);

        // Applies predictions from an uploaded CSV onto HealthConnectTrainingDataTable, then
        // regenerates and persists the refreshed CSV into AiTrainingDataFileTable - callers don't
        // need the bytes back, they're already stored.
        Task UpdatedWorkOutIntensityTrainingCsvDataAsync(byte[] csvData, CancellationToken cancellationToken = default);

        // Returns whatever CSV is currently stored in AiTrainingDataFileTable, without touching
        // HealthConnectTrainingDataTable - null if nothing has been generated/uploaded yet.
        Task<byte[]?> GetExistingWorkOutIntensityCsvAsync(CancellationToken cancellationToken = default);
    }
}
