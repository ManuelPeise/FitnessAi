using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IAiTrainingDataFileService
    {
        Task<byte[]?> GetCsvAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default);
        Task UploadCsvAsync(AiModelTypeEnum aiType, byte[] csv, CancellationToken cancellationToken = default);
    }
}
