using Data.Accessor.Interfaces;
using Data.Database.Entities.Scheduler;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;

namespace AiUnitTests.Fakes
{
    internal class FakeApplicationUnitOfWork : IApplicationUnitOfWork
    {
        public FakeRepository<UserEntity> User { get; } = new();
        public FakeRepository<UserCredentialsEntity> UserCredentials { get; } = new();
        public FakeRepository<UserBodyDataEntity> UserBodyData { get; } = new();
        public FakeRepository<SettingsEntity> Settings { get; } = new();
        public FakeRepository<AISettingsEntity> AiSettings { get; } = new();
        public FakeRepository<ScheduledJobEntity> ScheduledJobs { get; } = new();
        public FakeRepository<SpecialSettingsEntity> SpecialSettings { get; } = new();
        public int SaveChangesCallCount { get; private set; }

        public IRepositoryBase<UserEntity> UserRepository => User;
        public IRepositoryBase<UserCredentialsEntity> UserCredentialsRepository => UserCredentials;
        public IRepositoryBase<UserBodyDataEntity> UserBodyDataRepository => UserBodyData;
        public IRepositoryBase<SettingsEntity> SettingsRepository => Settings;
        public IRepositoryBase<AISettingsEntity> AISettingsRepository => AiSettings;
        public IRepositoryBase<ScheduledJobEntity> ScheduledJobsRepository => ScheduledJobs;
        
        public IRepositoryBase<SpecialSettingsEntity> SpecialSettingsRepository => SpecialSettings;
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCallCount++;
            return Task.FromResult(0);
        }
    }
}
