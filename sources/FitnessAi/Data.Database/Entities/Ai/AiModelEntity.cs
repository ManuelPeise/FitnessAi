using Data.Database.Entities.User;
using Shared.Enums.Ai;
using Shared.Enums.HealthConnect;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Ai
{
    public class AiModelEntity : AEntityBase
    {
        public Guid ModelId { get; set; }
        public AiModelTypeEnum ModelType { get; set; }
        public ExerciseTypeEnum? ExerciseType { get; set; }
        public int Version { get; set; }
        public bool IsActive { get; set; }

        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;

        public AiModelBinaryEntity? Binary { get; set; }
    }
}
