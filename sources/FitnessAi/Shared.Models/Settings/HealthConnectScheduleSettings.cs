using Shared.Enums.Settings;

namespace Shared.Models.Settings
{
    public class HealthConnectScheduleSettings
    {
        // The unique identifier for the HealthConnect schedule
        public string ScheduleId { get; set; } = null!;
        // The name of the HealthConnect schedule
        public string Name { get; set; } = string.Empty;
        // The device ID for the HealthConnect integration
        public string? DeviceId { get; set; }
        // The interval type for the HealthConnect schedule (hourly, daily, weekly, monthly)
        public IntervallTypeEnum? IntervallType { get; set; }
        // The time zone information for the HealthConnect schedule
        public TimeZoneInfo TimeZoneInfo { get; set; } = null!;
        // The day of the week for the HealthConnect schedule (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        public int? DayOfTheWeek { get; set; }
        // The scheduled hour for the HealthConnect schedule (0-23)
        public int? Hour { get; set; }
        // The scheduled minute for the HealthConnect schedule (0-59)
        public int? Minute { get; set; }
        // The number of past days to import data for the HealthConnect schedule defaulting to 365 days after the initial load is complete is set to 5
        public int PastDaysToImport { get; set; } = 5;
        // The number of past days to import data for the initial load of the HealthConnect schedule
        public int InitialLoadPastDaysToImport { get; set; } = 365;
        // Indicates whether the HealthConnect schedule is active or not
        public bool IsActive { get; set; }
        // Indicates whether the HealthConnect schedule is in the initial load phase or not
        public bool IsInitialLoad { get; set; }
        // Indicates whether the HealthConnect schedule is connected to the HealthConnect service or not
        public bool IsConnected { get; set; }
        /// <summary>
        /// The date and time when the HealthConnect schedule was last modified.
        /// </summary>
        public DateTime? LastModificationAt { get; set; }
        /// <summary>
        ///     The user who last modified the HealthConnect schedule.
        /// </summary>
        public string? LastModificationBy { get; set; }
        public List<HealthConnectOriginMapping> OriginMappings { get; set; } = [];

    }
}
