using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect;
using System;
using System.Collections.Generic;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectTrainingData
    {
        public string AppKey { get; set; } = null!;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public HealthConnectExerciseTypeEnum ExerciseType { get; set; }
        public string Origin { get; set; } = null!;
        public TimeZoneInfo TimeZoneInfo { get; set; } = new();
        public List<HealthConnectTrainingMetricData> TrainingMetricData { get; set; } = [];
        public List<TrainingSegments> TrainingSegments { get; set; } = [];
        public List<TrainingLap> Laps { get; set; } = [];
    }
}