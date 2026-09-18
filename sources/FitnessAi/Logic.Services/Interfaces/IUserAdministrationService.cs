using Shared.Enums.Authentication;
using Shared.Models.Authentication;

namespace Logic.Services.Interfaces
{
    public interface IUserAdministrationService
    {
        Task<IReadOnlyList<UserAdministrationListItemModel>> GetUsersAsync(CancellationToken cancellationToken = default);
        Task<UserAdministrationDetailsModel> GetUserDetailsAsync(long userId, CancellationToken cancellationToken = default);

        // Throws InvalidOperationException when userId is the current user's own id.
        Task UpdateUserRolesAsync(long userId, UserRoleEnum roles, CancellationToken cancellationToken = default);
        Task UpdateActiveStateAsync(long userId, bool isActive, CancellationToken cancellationToken = default);
        Task SoftDeleteUserAsync(long userId, CancellationToken cancellationToken = default);
        Task RestoreUserAsync(long userId, CancellationToken cancellationToken = default);
        Task PurgeSoftDeletedUsersAsync(CancellationToken cancellationToken = default);
    }
}
