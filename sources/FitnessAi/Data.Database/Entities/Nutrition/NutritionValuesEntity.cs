namespace Data.Database.Entities.Nutrition
{
    public class NutritionValuesEntity : AEntityBase
    {
        public decimal? CaloriesKcal { get; set; }
        public decimal? ProteinGrams { get; set; }
        public decimal? CarbohydratesGrams { get; set; }
        public decimal? FatGrams { get; set; }
        public decimal? FiberGrams { get; set; }
        public decimal? SugarGrams { get; set; }

        public NutritionDataEntity Record { get; set; } = null!;
    }
}
