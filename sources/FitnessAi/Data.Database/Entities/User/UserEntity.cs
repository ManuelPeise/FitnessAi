using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Settings;
using Shared.Enums.Authentication;
using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Database.Entities.User
{
    public class UserEntity:AEntityBase
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string AppId { get; set; } = null!;
        public UserRoleEnum UserRole { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? DeletedAt { get; set; }

        public long CredentialsId { get; set; }
        [ForeignKey(nameof(CredentialsId))]
        public UserCredentialsEntity UserCredentials { get; set; } = null!;
        public long SettingsId { get; set; }
        [ForeignKey(nameof(SettingsId))]
        public SettingsEntity Settings { get; set; } = null!;

        public ICollection<HealthConnectHealthDataEntity> HealthData { get; set; } = [];
        public ICollection<HealthConnectTrainingDataEntity> TrainingData { get; set; } = [];

    }
}
