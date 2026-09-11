using System.ComponentModel.DataAnnotations.Schema;


namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectValuesEntity: AEntityBase
    {
        public decimal? ActiveCaloriesBurnedInKcal { get; set; }
        public decimal? TotalCaloriesBurnedInKcal { get; set; }
        public decimal? HydrationAvg { get; set; }
        public decimal? Steps { get; set; }
        public decimal? Weight { get; set; }
        public decimal? SleepDurationInSeconds { get; set; }
        public decimal? FloorsClimbed { get; set; }
        public decimal? BasalMetabolicRateInKcal { get; set; }
        public decimal? WheelchairPushes { get; set; }
        public decimal? HeightInMeters { get; set; }
        public decimal? BodyFatPercentageAvg { get; set; }

        public long HeartRateId { get; set; }
        [ForeignKey(nameof(HeartRateId))]
        public HealthConnectAvgEntity? HeartRate { get; set; }

        public HealthConnectBloodPressureEntity? BloodPressure { get; set; }

        public long RestingHeartRateId { get; set; }
        [ForeignKey(nameof(RestingHeartRateId))]
        public HealthConnectAvgEntity? RestingHeartRate { get; set; }

        public HealthConnectHealthDataEntity Record { get; set; } = null!;
    }
}
