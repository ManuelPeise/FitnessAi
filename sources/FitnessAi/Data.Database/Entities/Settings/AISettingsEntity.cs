using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Settings
{
    public class AISettingsEntity: AEntityBase
    {
        public bool CanUseHealthDataForAiTraining { get; set; }
        public DateTime? CanUseHealthDataAcceptedAt { get; set; }
        public DateTime? CanUseHealthDataRejectedAt { get; set; }
    }
}
