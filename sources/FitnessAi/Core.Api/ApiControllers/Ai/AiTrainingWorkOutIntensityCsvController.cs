using Logic.Ai.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.ApiControllers.Ai
{
    public class AiTrainingWorkOutIntensityCsvController : ApiControllerBase
    {
        private const string CsvFileName = "WorkoutIntensityAiTrainingData.csv";

        private readonly IAiWorkOutIntensityTrainingFileService _workOutIntensityCsvService;

        public AiTrainingWorkOutIntensityCsvController(IAiWorkOutIntensityTrainingFileService workOutIntensityCsvService)
        {
            _workOutIntensityCsvService = workOutIntensityCsvService;
        }

        [HttpGet(Name = "LoadInitialWorkOutIntensityTrainingCsv")]
        public async Task<IActionResult> LoadInitialWorkOutIntensityTrainingCsv(
            [FromQuery] int itemsCount, CancellationToken cancellationToken = default)
        {
            var csv = await _workOutIntensityCsvService.LoadInitialWorkOutIntensityTrainingCsvAsync(itemsCount, cancellationToken);

            return File(csv, "text/csv", CsvFileName);
        }

        [HttpGet(Name = "GetExistingWorkOutIntensityCsv")]
        public async Task<IActionResult> GetExistingWorkOutIntensityCsv(CancellationToken cancellationToken = default)
        {
            var csv = await _workOutIntensityCsvService.GetExistingWorkOutIntensityCsvAsync(cancellationToken);

            if (csv == null)
            {
                return NotFound();
            }

            return File(csv, "text/csv", CsvFileName);
        }

        [HttpPost(Name = "UpdateWorkOutIntensityTrainingCsvData")]
        public async Task UpdateWorkOutIntensityTrainingCsvData(IFormFile file, CancellationToken cancellationToken = default)
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream, cancellationToken);

            await _workOutIntensityCsvService.UpdatedWorkOutIntensityTrainingCsvDataAsync(memoryStream.ToArray(), cancellationToken);
        }
    }
}
