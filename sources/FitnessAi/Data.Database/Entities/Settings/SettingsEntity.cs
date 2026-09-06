using Data.Database.Entities.User;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.Settings
{
    public class SettingsEntity: AEntityBase
    {
        public long AiSettingsId { get; set; }
        [ForeignKey(nameof(AiSettingsId))]
        public AISettingsEntity AiSettings { get; set; } = null!;
    }
}
