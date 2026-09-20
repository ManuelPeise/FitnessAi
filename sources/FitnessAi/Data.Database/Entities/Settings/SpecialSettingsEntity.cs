using Data.Database.Entities.User;
using Shared.Enums.Settings;
using System.ComponentModel.DataAnnotations.Schema;


namespace Data.Database.Entities.Settings
{
    public class SpecialSettingsEntity: AEntityBase
    {
        public string ModuleName { get; set; } = null!;
        public SettingsTypeEnum SettingsType { get; set; }
        public string? SettingsJson { get; set; }
        public long UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public UserEntity User { get; set; } = null!;
    }
}
