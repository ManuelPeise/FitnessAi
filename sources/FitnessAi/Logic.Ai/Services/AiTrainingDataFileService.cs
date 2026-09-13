using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Ai;
using Logic.Ai.Interfaces;
using Shared.Enums.Ai;

namespace Logic.Ai.Services
{
    // Persistence for AiTrainingDataFileTable - stores/retrieves the raw CSV bytes per AiType.
    // Deliberately does not validate/parse the CSV via ICsvModelLoader<TModel>: no concrete
    // TModel/ColumnDefinition is registered yet, so this stays model-agnostic.
    public class AiTrainingDataFileService : IAiTrainingDataFileService
    {
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public AiTrainingDataFileService(IAiUnitOfWork aiUnitOfWork)
        {
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task<byte[]?> GetCsvAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default)
        {
            var file = await GetFileAsync(aiType, cancellationToken);
            return file?.Csv;
        }

        public async Task UploadCsvAsync(AiModelTypeEnum aiType, byte[] csv, CancellationToken cancellationToken = default)
        {
            var file = await GetFileAsync(aiType, cancellationToken);

            if (file == null)
            {
                await _aiUnitOfWork.AiTrainingDataFileRepository.AddAsync(
                    new AiTrainingDataFileEntity { AiType = aiType, Csv = csv, IsUpdated = true }, cancellationToken);
            }
            else
            {
                file.Csv = csv;
                file.IsUpdated = true;
                await _aiUnitOfWork.AiTrainingDataFileRepository.UpdateAsync(file, cancellationToken);
            }

            await _aiUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<AiTrainingDataFileEntity?> GetFileAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken)
        {
            return await _aiUnitOfWork.AiTrainingDataFileRepository.GetSingleAsync(new DbQueryOptions<AiTrainingDataFileEntity>
            {
                WhereExpression = x => x.AiType == aiType,
            }, asNoTracking: true, cancellationToken: cancellationToken);
        }
    }
}
