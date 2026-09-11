using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.HealthConnect
{
    public class HealthConnectTrainingDataValuesEntity: AEntityBase
    {
        public decimal? ActiveCaloriesBurnedInKcal { get; set; }
        public decimal? DistanceInMeters { get; set; }
        public decimal? DurationSeconds { get; set; }
        public decimal? ElevationAvg { get; set; }
        public decimal? HydrationAvg { get; set; }       
        public decimal? Steps { get; set; }      
        public decimal? WeightAvg { get; set; }
        public string? Notes { get; set; } 
        public long CyclingPedalingCadenceId { get; set; }
        [ForeignKey(nameof(CyclingPedalingCadenceId))]
        public HealthConnectAvgEntity? CyclingPedalingCadence { get; set; }

        public long HeartRateId { get; set; }
        [ForeignKey(nameof(HeartRateId))]
        public HealthConnectAvgEntity? HeartRate { get; set; }

        public long PowerId { get; set; }
        [ForeignKey(nameof(PowerId))]
        public HealthConnectAvgEntity? Power { get; set; }

        public long SpeedId { get; set; }
        [ForeignKey(nameof(SpeedId))]
        public HealthConnectAvgEntity? Speed { get; set; }

        public long RestingHeartRateId { get; set; }
        [ForeignKey(nameof(RestingHeartRateId))]
        public HealthConnectAvgEntity? RestingHeartRate { get; set; }

        public long StepCadenceId { get; set; }
        [ForeignKey(nameof(StepCadenceId))]
        public HealthConnectAvgEntity? StepCadence { get; set; }

        public ICollection<HealthConnectLapEntity> Laps { get; set; } = [];
        public ICollection<HealthConnectSegmentEntity> Segments { get; set; } = [];

    }
}
