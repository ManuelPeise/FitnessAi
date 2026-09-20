using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;
using Logic.Modules.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Shared.Enums.Settings;
using Shared.Models.Settings;
using System.Linq.Expressions;

namespace Logic.Modules.HealthConnect
{
    public class HealthConnectConfiguration : IHealthConnectConfiguration
    {
        private readonly ILogger<HealthConnectConfiguration> _logger;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public HealthConnectConfiguration(
            ILogger<HealthConnectConfiguration> logger,
            IApplicationUnitOfWork applicationUnitOfWork,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _applicationUnitOfWork = applicationUnitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<List<HealthConnectScheduleSettings>> GetScheduleSettings()
        {
            try
            {
                var currentUser = await _currentUserService.GetCurrentUser();

                if (currentUser == null)
                {
                    throw new Exception("Current user not found.");
                }

                var settingsEntity = await LoadConfigurationFromDatabase(currentUser.Id);

                if (settingsEntity == null)
                {
                    return new List<HealthConnectScheduleSettings>();
                }

                var healthConnectScheduleSettingsModel = JsonConvert.DeserializeObject<List<HealthConnectScheduleSettings>>(settingsEntity?.SettingsJson ?? "") ?? null;

                return healthConnectScheduleSettingsModel ?? new List<HealthConnectScheduleSettings>();
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while retrieving HealthConnect configuration.");

                return new List<HealthConnectScheduleSettings>();
            }
        }

        public async Task<HealthConnectScheduleSettings?> GetClientScheduleSettings(string deviceId)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(deviceId, nameof(deviceId));

                var currentUser = await _currentUserService.GetCurrentUser();

                if (currentUser == null)
                {
                    throw new Exception("Current user not found.");
                }

                var settingsEntity = await LoadConfigurationFromDatabase(currentUser.Id);

                ArgumentException.ThrowIfNullOrWhiteSpace(settingsEntity?.SettingsJson, nameof(settingsEntity.SettingsJson));

                var healthConnectScheduleSettings = JsonConvert.DeserializeObject<List<HealthConnectScheduleSettings>>(settingsEntity.SettingsJson)!;

                healthConnectScheduleSettings = ConnectDevice(healthConnectScheduleSettings, deviceId);

                settingsEntity.SettingsJson = JsonConvert.SerializeObject(healthConnectScheduleSettings);
                
                await _applicationUnitOfWork.SpecialSettingsRepository.UpdateAsync(settingsEntity);
                await _applicationUnitOfWork.SaveChangesAsync();

                return healthConnectScheduleSettings.SingleOrDefault(s => s.DeviceId == deviceId) ??
                    throw new Exception($"HealthConnect schedule settings for deviceId '{deviceId}' not found.");
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while retrieving HealthConnect configuration.");

                return null;
            }
        }

        public async Task<List<HealthConnectScheduleSettings>> UpdateHealthConnectScheduleSettings(HealthConnectScheduleSettings scheduleSettingsUpdate)
        {
            try
            {
                var isDatabaseModified = false;
                var currentUser = await _currentUserService.GetCurrentUser();

                if (currentUser == null)
                {
                    throw new Exception("Current user not found.");
                }

                var settingsEntity = await LoadConfigurationFromDatabase(currentUser.Id);

                var healthConnectScheduleSettings = JsonConvert.DeserializeObject<List<HealthConnectScheduleSettings>>(settingsEntity?.SettingsJson ?? "") ?? new List<HealthConnectScheduleSettings>();

                if (!healthConnectScheduleSettings.Any(s => s.ScheduleId == scheduleSettingsUpdate.ScheduleId))
                {
                    scheduleSettingsUpdate.ScheduleId = Guid.NewGuid().ToString();
                    healthConnectScheduleSettings.Add(scheduleSettingsUpdate);

                    isDatabaseModified = true;
                }
                else
                {
                    var existingSchedule = healthConnectScheduleSettings.Single(s => s.ScheduleId == scheduleSettingsUpdate.ScheduleId);

                    healthConnectScheduleSettings = await UpdateHealthConnectScheduleSettings(healthConnectScheduleSettings, scheduleSettingsUpdate);

                    isDatabaseModified = true;
                }

                if (isDatabaseModified)
                {
                    settingsEntity = settingsEntity ?? GetNewSpecialSettingsEntity(currentUser.Id);

                    settingsEntity.SettingsJson = JsonConvert.SerializeObject(healthConnectScheduleSettings);

                    await _applicationUnitOfWork.SpecialSettingsRepository.UpdateAsync(settingsEntity);
                    await _applicationUnitOfWork.SaveChangesAsync();
                }

                return healthConnectScheduleSettings;

            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while updating HealthConnect settings.");

                throw new Exception("An error occurred while updating HealthConnect settings.", exception);
            }
        }

        public async Task<List<HealthConnectScheduleSettings>> DeleteSchedule(DeleteScheduleRequest request)
        {
            try
            {
                var currentUser = await _currentUserService.GetCurrentUser();
                if (currentUser == null)
                {
                    throw new Exception("Current user not found.");
                }
                var settingsEntity = await LoadConfigurationFromDatabase(currentUser.Id) ?? throw new Exception("HealthConnect settings not found.");

                var healthConnectScheduleSettings = JsonConvert.DeserializeObject<List<HealthConnectScheduleSettings>>(settingsEntity.SettingsJson ?? "") ?? null;

                if (healthConnectScheduleSettings == null)
                {
                    throw new Exception("Failed to deserialize existing HealthConnect settings.");
                }

                healthConnectScheduleSettings = healthConnectScheduleSettings.Where(s => s.ScheduleId != request.ScheduleId).ToList() ?? new List<HealthConnectScheduleSettings>();

                settingsEntity.SettingsJson = JsonConvert.SerializeObject(healthConnectScheduleSettings);

                await _applicationUnitOfWork.SpecialSettingsRepository.UpdateAsync(settingsEntity);
                await _applicationUnitOfWork.SaveChangesAsync();

                return healthConnectScheduleSettings;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while deleting HealthConnect schedule.");
                throw new Exception("An error occurred while deleting HealthConnect schedule.", exception);
            }
        }

        #region Private Methods

        private async Task<SpecialSettingsEntity> LoadConfigurationFromDatabase(long userId)
        {
            var userEntity = await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
            {
                WhereExpression = u => u.Id == userId,
                Includes = new List<Expression<Func<UserEntity, object>>>
                {
                    u => u.SpecialSettings
                }
            });

            var healthConnectSettings = userEntity?.SpecialSettings
                .SingleOrDefault(setting => setting.SettingsType == SettingsTypeEnum.HealthConnectSettings) ??
                GetNewSpecialSettingsEntity(userId);

            return healthConnectSettings;
        }

        private SpecialSettingsEntity GetNewSpecialSettingsEntity(long userId)
        {
            return new SpecialSettingsEntity
            {
                UserId = userId,
                ModuleName = ModuleNames.HealthConnectModule,
                SettingsType = SettingsTypeEnum.HealthConnectSettings,
                SettingsJson = JsonConvert.SerializeObject(new List<HealthConnectScheduleSettings>())
            };
        }

        private async Task<List<HealthConnectScheduleSettings>> UpdateHealthConnectScheduleSettings(List<HealthConnectScheduleSettings> existingSchedules, HealthConnectScheduleSettings scheduleSettingsUpdate)
        {
            var currentUser = await _currentUserService.GetCurrentUser();

            foreach (var schedule in existingSchedules)
            {
                if (schedule.DeviceId != scheduleSettingsUpdate.DeviceId)
                {
                    continue;
                }

                schedule.Name = scheduleSettingsUpdate.Name;
                schedule.IntervallType = scheduleSettingsUpdate.IntervallType;
                schedule.TimeZoneInfo = scheduleSettingsUpdate.TimeZoneInfo;
                schedule.DayOfTheWeek = scheduleSettingsUpdate.DayOfTheWeek;
                schedule.Hour = scheduleSettingsUpdate.Hour;
                schedule.Minute = scheduleSettingsUpdate.Minute;
                schedule.PastDaysToImport = scheduleSettingsUpdate.PastDaysToImport;
                schedule.InitialLoadPastDaysToImport = scheduleSettingsUpdate.InitialLoadPastDaysToImport;
                schedule.IsActive = scheduleSettingsUpdate.IsActive;
                schedule.IsInitialLoad = scheduleSettingsUpdate.IsInitialLoad;
                schedule.LastModificationAt = DateTime.UtcNow;
                schedule.LastModificationBy = currentUser.Email;
                schedule.OriginMappings = scheduleSettingsUpdate.OriginMappings;

            }

            return existingSchedules;
        }

        private List<HealthConnectScheduleSettings> ConnectDevice(List<HealthConnectScheduleSettings> healthConnectScheduleSettings, string deviceId)
        {
            foreach (var schedule in healthConnectScheduleSettings)
            {
                if (schedule.DeviceId == deviceId)
                {
                    schedule.IsConnected = true;
                }
            }

            return healthConnectScheduleSettings;
        }

        #endregion
    }
}
