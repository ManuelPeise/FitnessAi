using System.ComponentModel.DataAnnotations.Schema;


namespace Data.Database.Entities.User
{
    public class UserBodyDataEntity : AEntityBase
    {
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public bool CanUpdateWeightOnHealthDataImport { get; set; }
        public decimal? BodyFatPercentageAvg { get; set; }
        public bool CanUpdateBodyFatPercentageOnHealthDataImport { get; set; }
        public decimal? Waist { get; set; }
        public decimal? Abdomen { get; set; }
        public decimal? ShoulderWidth { get; set; }

        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;

        [NotMapped]
        public decimal Bmi => CalculateBmi();

        private decimal CalculateBmi()
        {
            if (Height == null || Height <= 0 || Weight == null || Weight <= 0)
            {
                return 0;
            }

            return Weight.Value / ((Height.Value / 100m) * (Height.Value / 100m));
        }
    }
}
