namespace Shared.Models.HealthConnect
{
    public class HealthConnectExportMetaData
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public string Origin { get; set; } = null!;
        public string Type { get; set; } = null!;
    }
}
