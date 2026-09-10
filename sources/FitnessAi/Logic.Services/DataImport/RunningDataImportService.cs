using Data.Accessor.Interfaces;
using Logic.Services.Interfaces;


namespace Logic.Services.DataImport
{
    public class RunningDataImportService : IRunningDataImportService
    {
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public RunningDataImportService(
            IApplicationUnitOfWork applicationUnitOfWork,
            IAiUnitOfWork aiUnitOfWork)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task ImportRunningDataAsync(
            long userId,
            IReadOnlyList<string> csvContentRows,
            char delimiter,
            CancellationToken cancellationToken = default)
        {
            var userEntity = await _applicationUnitOfWork.UserRepository.GetByIdAsync(
                userId,
                true,
                null,
                cancellationToken);

            if (userEntity == null)
            {
                // User not found, handle accordingly
                return;
            }

           
        }      
    }
}
