using Core.Api.AuthorizationAttributes;
using Logic.Ai.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;

namespace Core.Api.ApiControllers.Ai
{
    
    public class AiTrainingDataGenerationController: ApiControllerBase
    {
        private readonly IAiTrainingDataBuilder _aiTrainingDataBuilder;

        public AiTrainingDataGenerationController(IAiTrainingDataBuilder aiTrainingDataBuilder)
        {
            _aiTrainingDataBuilder = aiTrainingDataBuilder;
        }

        //[MaintenanceApiAuthentication(UserRoleEnum.MaintenanceRole)]
        [HttpPost(Name = "GenerateAiTrainingData")]
        public async Task GenerateAiTrainingData()
        {
          await _aiTrainingDataBuilder.BuildAiExerciseTrainingData();
        }
    }
}
