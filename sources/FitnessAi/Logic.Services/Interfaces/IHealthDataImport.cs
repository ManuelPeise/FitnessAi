using Shared.Models.HealthConnect;

namespace Logic.Services.Interfaces
{
    public interface IHealthDataImport
    {
        Task ImportHealthData(List<HealthConnectDataExport> dataExportModels);
    }
}
