using Data.Database.Entities.User;

namespace Data.Accessor.Interfaces
{
    public interface IApplicationUnitOfWork
    {
        IRepositoryBase<UserEntity> UserRepository { get; }
        IRepositoryBase<UserCredentialsEntity> UserCredentialsRepository { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
