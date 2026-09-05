using Core.Api.AuthorizationAttributes;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;
using Shared.Models.HealthConnect;
using System.Text.Json;

namespace Core.Api.ApiControllers.Import
{
    public class HealthConnectImportController: ApiControllerBase
    {
        public HealthConnectImportController()
        {
            
        }

        [HttpPost(Name = "ImportHealthData")]
        public async Task ImportHealthData()
        {

        }

        [ApiAuthentication(UserRoleEnum.UserRole | UserRoleEnum.AdminRole)]
        [HttpPost(Name = "ImportTrainingData")]
        public async Task ImportTrainingData([FromBody] List<HealthConnectTrainingData> trainingData)
        {
            Console.WriteLine(JsonSerializer.Serialize(trainingData));

        }
    }
}
