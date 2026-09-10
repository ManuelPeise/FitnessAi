using Shared.Models.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;

namespace Logic.Services.Interfaces
{
    public interface IHealthDataImport
    {
        Task ImportHealthConnectData(List<HealthConnectDailyDataModel> models);
    }
}
