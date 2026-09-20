using Core.Api.AuthorizationAttributes;
using Logic.Modules.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;
using Shared.Models.Settings;

namespace Core.Api.ApiControllers.Modules
{
    public class HealthConnectConfigurationController: ApiControllerBase
    {
        private readonly IHealthConnectConfiguration _healthConnectConfiguration;

        public HealthConnectConfigurationController(IHealthConnectConfiguration healthConnectConfiguration)
        {
            _healthConnectConfiguration = healthConnectConfiguration;
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpGet(Name = "GetScheduleSettings")]
        public async Task<List<HealthConnectScheduleSettings>> GetScheduleSettings()
        {
            return await _healthConnectConfiguration.GetScheduleSettings();
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpPost(Name = "GetClientScheduleSettings")]
        public async Task<HealthConnectScheduleSettings?> GetClientScheduleSettings([FromBody] GetScheduleRequest request)
        {
            return await _healthConnectConfiguration.GetClientScheduleSettings(request?.DeviceId?? "");
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpPost(Name = "UpdateScheduleSettings")]
        public async Task<List<HealthConnectScheduleSettings>> UpdateScheduleSettings([FromBody] HealthConnectScheduleSettings settingsUpdate)
        {
            return await _healthConnectConfiguration.UpdateHealthConnectScheduleSettings(settingsUpdate);
        }

        [ApiAuthentication(UserRoleEnum.UserRole)]
        [HttpPost(Name = "DeleteSchedule")]
        public async Task<List<HealthConnectScheduleSettings>> DeleteSchedule([FromBody] DeleteScheduleRequest request)
        {
            return await _healthConnectConfiguration.DeleteSchedule(request);
        }
    }
}
