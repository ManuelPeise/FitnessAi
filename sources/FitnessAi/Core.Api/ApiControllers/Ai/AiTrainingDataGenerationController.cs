using Core.Api.AuthorizationAttributes;
using Logic.Ai.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;

namespace Core.Api.ApiControllers.Ai
{
    [ApiAuthentication(UserRoleEnum.MaintenanceRole)]
    public class AiTrainingDataGenerationController: ControllerBase
    {
        private readonly IAiTrainingDataBuilder _aiTrainingDataBuilder;

        public AiTrainingDataGenerationController(IAiTrainingDataBuilder aiTrainingDataBuilder)
        {
            _aiTrainingDataBuilder = aiTrainingDataBuilder;
        }

        [HttpPost]
        public async Task GenerateAiTrainingData()
        {
           await _aiTrainingDataBuilder.BuildAiExerciseTrainingData();
        }
    }
}
