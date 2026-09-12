using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Ai
{
    public class AiModelBinaryEntity : AEntityBase
    {
        public byte[] ModelData { get; set; } = null!;

        public long AiModelId { get; set; }
        [ForeignKey(nameof(AiModelId))]
        public AiModelEntity AiModel { get; set; } = null!;
    }
}
