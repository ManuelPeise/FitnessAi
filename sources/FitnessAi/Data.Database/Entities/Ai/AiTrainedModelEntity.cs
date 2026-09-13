using Shared.Enums.Ai;

namespace Data.Database.Entities.Ai
{
    public class AiTrainedModelEntity : AEntityBase
    {
        public AiModelTypeEnum AiType { get; set; }
        public string Version { get; set; } = null!;
        public byte[] ModelData { get; set; } = null!;
        public double MicroAccuracy { get; set; }
        public double MacroAccuracy { get; set; }
        public double LogLoss { get; set; }
    }
}
