using Data.Database.Entities.User;

namespace Logic.Shared.Interfaces
{
    public interface ICurrentUserService
    {
        long UserId { get; }
        bool IsAuthenticated { get; }
        Task<UserEntity> GetCurrentUser();
        bool UserIsInRole(string role);
    }
}
