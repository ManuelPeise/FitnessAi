using Data.Database.Entities.Scheduler;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;

namespace Data.Accessor.Interfaces
{
    public interface IApplicationUnitOfWork
    {
        IRepositoryBase<UserEntity> UserRepository { get; }
        IRepositoryBase<UserCredentialsEntity> UserCredentialsRepository { get; }
        IRepositoryBase<UserBodyDataEntity> UserBodyDataRepository { get; }
        IRepositoryBase <SettingsEntity> SettingsRepository { get; }
        IRepositoryBase<AISettingsEntity> AISettingsRepository { get; }
        IRepositoryBase<ScheduledJobEntity> ScheduledJobsRepository { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
