namespace Shared.Models.HealthConnect
{
    public class HealthConnectApiModel
    {
        public List<HealthConnectDataExport> TrainingData { get; set; } = [];
        public List<HealthConnectDataExport> HealthData { get; set; } = [];
    }
}
