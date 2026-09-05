using Core.Api.AuthorizationAttributes;
using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;
using Shared.Models.HealthConnect;

namespace Core.Api.ApiControllers.Import
{
    public class HealthConnectImportController: ApiControllerBase
    {
        private readonly IHealthDataImport _healthDataImport;

        public HealthConnectImportController(IHealthDataImport healthDataImport)
        {
            _healthDataImport = healthDataImport;
        }

        [ApiAuthentication(UserRoleEnum.UserRole | UserRoleEnum.AdminRole)]
        [HttpPost(Name = "ImportHealthData")]
        public async Task ImportHealthData([FromBody] List<HealthConnectDataExport> dataExportModels)
        {
            await _healthDataImport.ImportHealthData(dataExportModels);
        }
    }
}
