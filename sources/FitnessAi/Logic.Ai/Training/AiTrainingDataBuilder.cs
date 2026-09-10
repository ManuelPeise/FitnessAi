using Data.Accessor.Interfaces;
using Logic.Ai.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;

namespace Logic.Ai.Training
{
    public class AiTrainingDataBuilder : IAiTrainingDataBuilder
    {
        private readonly ILogger<AiTrainingDataBuilder> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IHealthUnitOfWork _healthUnitOfWork;
        private readonly IAiUnitOfWork _aiUnitOfWork;

        public AiTrainingDataBuilder(
            ILogger<AiTrainingDataBuilder> logger,
            ICurrentUserService currentUserService,
            IApplicationUnitOfWork applicationUnitOfWork,
            IHealthUnitOfWork healthUnitOfWork,
            IAiUnitOfWork aiUnitOfWork)
        {
            _logger = logger;
            _currentUserService = currentUserService;
            _applicationUnitOfWork = applicationUnitOfWork;
            _healthUnitOfWork = healthUnitOfWork;
            _aiUnitOfWork = aiUnitOfWork;
        }

        public async Task BuildAiExerciseTrainingData()
        {
            try
            {
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building exercise training data");
            }
        }
    }
}
