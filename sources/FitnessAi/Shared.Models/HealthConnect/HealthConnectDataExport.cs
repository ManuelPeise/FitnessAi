namespace Shared.Models.HealthConnect
{
    public class HealthConnectDataExport
    {
        public HealthConnectExportMetaData MetaData { get; set; } = new();
        public List<HealthConnectDataEntry> Data { get; set; } = [];
    }
}
