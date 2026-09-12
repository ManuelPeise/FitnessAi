using Data.Database.Entities.User;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Nutrition
{
    public class NutritionDataEntity : AEntityBase
    {
        public string DataKey { get; set; } = null!;
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }

        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;

        public long NutritionValuesId { get; set; }
        [ForeignKey(nameof(NutritionValuesId))]
        public NutritionValuesEntity? Values { get; set; }
    }
}
