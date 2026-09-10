namespace Shared.Models.HealthConnect.RawDataModels
{
    public class HealthConnectMetadata
    {
        public string? Model { get; set; }
        public string? Manufacturer { get; set; }
        public int? RecordingMethod { get; set; }
        public HealthConnectDevice? Device { get; set; }
        public int? ClientRecordVersion { get; set; }
        public string? DataOrigin { get; set; }
        public string? ClientRecordId { get; set; }
        public DateTimeOffset? LastModifiedTime { get; set; }
        public string? Id { get; set; }
    }
}
