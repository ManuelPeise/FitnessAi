using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;

namespace Data.Accessor.Interfaces
{
    public interface IApplicationUnitOfWork
    {
        IRepositoryBase<UserEntity> UserRepository { get; }
        IRepositoryBase<UserCredentialsEntity> UserCredentialsRepository { get; }
        IRepositoryBase<HealthConnectDataEntity> HealthConnectDataRepository { get; }
        IRepositoryBase<SettingsEntity> SettingsRepository { get; }
        IRepositoryBase<AISettingsEntity> AISettingsRepository { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
