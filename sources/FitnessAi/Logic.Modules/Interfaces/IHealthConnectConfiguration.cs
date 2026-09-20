

using Shared.Models.Settings;

namespace Logic.Modules.Interfaces
{
    public interface IHealthConnectConfiguration
    {
        /// <summary>
        /// Gets the current HealthConnect configuration settings for the React Web App.
        /// Do not use for other purposes, this is only for the React Web App to get the current configuration.
        /// </summary>
        /// <returns>HealthConnectSettings or null</returns>
        Task<List<HealthConnectScheduleSettings>> GetScheduleSettings();
        /// <summary>
        /// Connects a specific device to the HealthConnect schedule configuration settings.
        /// </summary>
        /// <param name="deviceId"></param>
        /// <returns></returns>
        Task<HealthConnectScheduleSettings?> GetClientScheduleSettings(string deviceId);
        /// <summary>
        /// Updates the HealthConnect schedule configuration settings for a specific device.
        /// </summary>
        /// <param name="scheduleSettingsUpdate"></param>
        /// <returns></returns>
        Task<List<HealthConnectScheduleSettings>> UpdateHealthConnectScheduleSettings(HealthConnectScheduleSettings scheduleSettingsUpdate);
        /// <summary>
        /// Deletes the HealthConnect schedule configuration settings for a specific device.
        /// </summary>
        /// <param name="deviceId">The ID of the device for which to delete the schedule.</param>
        /// <returns>The updated HealthConnectSettings object.</returns>
        Task<List<HealthConnectScheduleSettings>> DeleteSchedule(DeleteScheduleRequest request);
    }
}
