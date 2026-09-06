using Data.Database.Models.Scheduler;
using Shared.Enums.Scheduler;
using System.Text.Json;

namespace Data.Database.Entities.Scheduler
{
    public class ScheduledJobEntity : AEntityBase
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string RequestModelJson { get; set; } = null!;
        public ScheduledJobStatus Status { get; set; }
        public DateTime PublishedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? FailedAt { get; set; }
        public string? ErrorMessage { get; set; }

        public WebServiceModel RequestModelJsonToModel()
        {
            var model = JsonSerializer.Deserialize<WebServiceModel>(RequestModelJson);

            return model ??
                throw new JsonException(
                    $"Request model of scheduled job '{Name}' could not be deserialized.");
        }

        public void ModelToRequestModel(WebServiceModel model)
        {
            RequestModelJson = JsonSerializer.Serialize(model);
        }
        
    }
}
