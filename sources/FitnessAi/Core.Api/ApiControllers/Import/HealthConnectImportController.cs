using Microsoft.AspNetCore.Mvc;
using Shared.Models.HealthConnect;

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

        [HttpPost(Name = "ImportTrainingData")]
        public async Task ImportTrainingData([FromBody] List<HealthConnectTrainingData> trainingData)
        {
            var test = 100;
        }
    }
}
