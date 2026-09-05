using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Shared.Models.HealthConnect
{
    public class HealthConnectTrainingMetricData
    {
        public int? HeartRate { get; set; }
        public int? MaxHeartRate { get; set; }
        public int? HeartRateVariability { get; set; }
        public int? OxygenSaturation { get; set; }
        public int? RespiratoryRate { get; set; }
        public int? Distance { get; set; }
        public int? Pace { get; set; }
        public int? Speed { get; set; }
        public int? MaxSpeed { get; set; }
        public int? Power { get; set; }
        public int? MaxPower { get; set; }
        public int Evaluation { get; set; }
        public int? Calories { get; set; }
        public int? ActiveCalories { get; set; }
        public int? Steps { get; set; }
        public int? Cadence { get; set; }
        public int? Vo2Max { get; set; }

    }
}