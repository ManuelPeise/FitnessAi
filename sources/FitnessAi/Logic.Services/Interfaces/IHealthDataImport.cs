using Shared.Models.HealthConnect;

namespace Logic.Services.Interfaces
{
    public interface IHealthDataImport
    {
        Task ImportHealthConnectData(HealthConnectApiModel requestModel);
    }
}
