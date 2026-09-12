using Logic.Ai.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.ApiControllers.Ai
{
    public class WorkoutIntensityPredictionController : ApiControllerBase
    {
        private readonly IWorkoutIntensityTrainingOrchestrator _orchestrator;

        public WorkoutIntensityPredictionController(IWorkoutIntensityTrainingOrchestrator orchestrator)
        {
            _orchestrator = orchestrator;
        }

        // [MaintenanceApiAuthentication(UserRoleEnum.MaintenanceRole)]
        [HttpPost(Name = "PredictWorkoutIntensity")]
        public async Task PredictWorkoutIntensity()
        {
            await _orchestrator.RunAsync();
        }
    }
}
