using Core.Api.AuthorizationAttributes;
using Logic.Ai.Interfaces;
using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;
using Shared.Models.HealthConnect.QueryModels;

namespace Core.Api.ApiControllers.HealthConnect
{
    public class TrainingDataController: ApiControllerBase
    {
        private readonly ITrainingDataService _trainingDataService;
        private readonly ITrainingIntensityPredictionService _trainingIntensityPredictionService;

        public TrainingDataController(
            ITrainingDataService trainingDataService,
            ITrainingIntensityPredictionService trainingIntensityPredictionService)
        {
            _trainingDataService = trainingDataService;
            _trainingIntensityPredictionService = trainingIntensityPredictionService;
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpGet(Name = "GetTrainingData")]
        public async Task<TrainingDataQueryResult> GetTrainingData([FromQuery] TrainingDataQuery query, CancellationToken cancellationToken = default)
        {
            return await _trainingDataService.GetTrainingDataAsync(query, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpPut(Name = "UpdateTrainingData")]
        public async Task UpdateTrainingData([FromBody] TrainingDataUpdateRequest request, CancellationToken cancellationToken = default)
        {
            await _trainingDataService.UpdateTrainingDataAsync(request, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpDelete(Name = "DeleteTrainingData")]
        public async Task DeleteTrainingData([FromQuery] long id, CancellationToken cancellationToken = default)
        {
            await _trainingDataService.DeleteTrainingDataAsync(id, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpGet(Name = "PredictWorkoutIntensity")]
        public async Task<List<TrainingDataPrediction>> PredictWorkoutIntensity([FromQuery] TrainingDataQuery query, CancellationToken cancellationToken = default)
        {
            return await _trainingIntensityPredictionService.PredictAsync(query, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpPut(Name = "ApplyWorkoutIntensityPredictions")]
        public async Task ApplyWorkoutIntensityPredictions([FromBody] List<TrainingDataPrediction> predictions, CancellationToken cancellationToken = default)
        {
            await _trainingDataService.ApplyWorkoutIntensityPredictionsAsync(predictions, cancellationToken);
        }
    }
}
