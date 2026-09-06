using Shared.Enums.HealthConnect;

namespace Data.Database.Entities.Ai
{
    public class AiHealthConnectExerciseTrainingDataEntity : AEntityBase
    {
        /// <summary>
        /// defines the key of the entity, which is a combination 
        /// userId_ExerciseType_StartDate_EndDate.
        /// </summary>
        public string Key { get; set; } = null!;
        /// <summary>
        /// Type of exercise associated with the exercise session
        /// </summary>
        public ExerciseTypeEnum ExerciseType { get; set; }
        /// <summary>
        /// StartTime of the exercise session
        /// </summary>
        public DateTime StartTimeStamp { get; set; }
        /// <summary>
        /// EndTime of the exercise session
        /// </summary>
        public DateTime EndTimeStamp { get; set; }
        /// <summary>
        /// Duration of the exercise session in seconds, 
        /// calculated as the difference between EndTimeStamp and StartTimeStamp.
        /// </summary>
        public decimal DurationSeconds => CalculateDuration();
        /// <summary>
        /// Weight of the user during the exercise session, in kilograms.
        /// </summary>
        public decimal Weight { get; set; }
        /// <summary>
        /// Distance covered during the exercise session, in meters.
        /// </summary>
        public decimal DistanceInMeters { get; set; }
        /// <summary>
        /// Number of steps taken during the exercise session.
        /// </summary>
        public decimal Steps { get; set; }
        /// <summary>
        /// VO2 max value of the user during the exercise session.
        /// </summary>
        public decimal Vo2Max { get; set; }
        /// <summary>
        /// Lean body mass of the user during the exercise session, in kilograms.
        /// </summary>
        public decimal LeanBodyMass { get; set; }
        /// <summary>
        /// Maximum heart rate of the user during the exercise session, in beats per minute.
        /// </summary>
        public decimal MaxHeartRate { get; set; }
        /// <summary>
        /// Minimum heart rate of the user during the exercise session, in beats per minute.
        /// </summary>
        public decimal MinHeartRate { get; set; }
        /// <summary>
        /// Average elevation gain of the user during the exercise session, in meters.
        /// </summary>
        public decimal ElevationGain { get; set; }
        ///  /// <summary>
        /// Total calories burned by the user during the exercise session.
        /// </summary>
        public decimal CaloriesBurned { get; set; }
        /// <summary>
        /// Body fat percentage of the user during the exercise session.
        /// </summary>
        public decimal BodyFat { get; set; }
        /// <summary>
        /// Average oxygen saturation of the user during the exercise session.
        /// </summary>
        public decimal OxygenSaturationAvg { get; set; }
        /// <summary>
        /// Average respiratory rate of the user during the exercise session, in breaths per minute.
        /// </summary>
        public decimal RespiratoryRatePerMinuteAvg { get; set; }
        /// <summary>
        /// Average pace of the user during the exercise session, in meters per second.
        /// </summary>
        public string PacePerKm => CalculatePacePerKm();
        /// <summary>
        /// Average heart rate of the user during the exercise session, in beats per minute.
        /// </summary>
        public decimal HeartRateAvg { get; set; }
        /// <summary>
        /// Average step frequency of the user during the exercise session, in steps per minute.
        /// </summary>
        public decimal StepsCadenceAvg { get; set; }
        /// <summary>
        /// Average power output of the user during the exercise session, in watts.
        /// </summary>
        public decimal PowerAvg { get; set; }
        /// <summary>
        /// Average speed of the user during the exercise session, in meters per second.
        /// </summary>
        public decimal SpeedAvg { get; set; }
        /// <summary>
        /// Average pedaling cadence of the user during the exercise session, in revolutions per minute.
        /// </summary>
        public decimal CyclingPedalingCadenceAvg { get; set; }


        public decimal CalculateDuration()
        {
            return (decimal)(EndTimeStamp - StartTimeStamp).TotalSeconds;
        }

        public string CalculatePacePerKm()
        {
            if (DistanceInMeters <= 0 || DurationSeconds <= 0)
            {
                return "n/a";
            }

            var secondsPerKilometer =
                DurationSeconds / DistanceInMeters * 1000m;

            var pace = TimeSpan.FromSeconds((double)secondsPerKilometer);

            return $"{pace:mm\\:ss}/km";
        }
    }
}
