using Shared.Enums.Ai;

namespace Data.Database.Entities.Ai
{
    public class AiTrainingDataFileEntity : AEntityBase
    {
        public AiModelTypeEnum AiType { get; set; }
        public byte[] Csv { get; set; } = null!;
        public bool IsUpdated { get; set; }
    }
}
