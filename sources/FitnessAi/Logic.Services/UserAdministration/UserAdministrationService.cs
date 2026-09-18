using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.User;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Shared.Enums.Authentication;
using Shared.Models.Authentication;

namespace Logic.Services.UserAdministration
{
    public class UserAdministrationService : IUserAdministrationService
    {
        private const int PurgeAfterDays = 30;

        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public UserAdministrationService(IApplicationUnitOfWork applicationUnitOfWork, ICurrentUserService currentUserService)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<UserAdministrationListItemModel>> GetUsersAsync(CancellationToken cancellationToken = default)
        {
            var users = await _applicationUnitOfWork.UserRepository.GetAsync(cancellationToken: cancellationToken);

            return users.Select(ToListItemModel).ToList();
        }

        public async Task<UserAdministrationDetailsModel> GetUserDetailsAsync(long userId, CancellationToken cancellationToken = default)
        {
            var user = await GetUserAsync(userId, asNoTracking: true, cancellationToken);

            return ToDetailsModel(user);
        }

        public async Task UpdateUserRolesAsync(long userId, UserRoleEnum roles, CancellationToken cancellationToken = default)
        {
            EnsureNotSelf(userId);

            var user = await GetUserAsync(userId, asNoTracking: false, cancellationToken);
            user.UserRole = roles;

            await _applicationUnitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task UpdateActiveStateAsync(long userId, bool isActive, CancellationToken cancellationToken = default)
        {
            EnsureNotSelf(userId);

            var user = await GetUserAsync(userId, asNoTracking: false, cancellationToken);
            user.IsActive = isActive;

            await _applicationUnitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task SoftDeleteUserAsync(long userId, CancellationToken cancellationToken = default)
        {
            EnsureNotSelf(userId);

            var user = await GetUserAsync(userId, asNoTracking: false, cancellationToken);
            user.IsActive = false;
            user.DeletedAt = DateTime.UtcNow;

            await _applicationUnitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task RestoreUserAsync(long userId, CancellationToken cancellationToken = default)
        {
            EnsureNotSelf(userId);

            var user = await GetUserAsync(userId, asNoTracking: false, cancellationToken);
            user.IsActive = true;
            user.DeletedAt = null;

            await _applicationUnitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task PurgeSoftDeletedUsersAsync(CancellationToken cancellationToken = default)
        {
            var purgeBefore = DateTime.UtcNow.AddDays(-PurgeAfterDays);

            var usersToPurge = await _applicationUnitOfWork.UserRepository.GetAsync(
                new DbQueryOptions<UserEntity>
                {
                    WhereExpression = x => x.DeletedAt != null && x.DeletedAt <= purgeBefore,
                },
                cancellationToken);

            await _applicationUnitOfWork.UserRepository.DeleteRange(usersToPurge, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private void EnsureNotSelf(long userId)
        {
            if (userId == _currentUserService.UserId)
            {
                throw new InvalidOperationException("An admin cannot modify their own account through user administration.");
            }
        }

        private async Task<UserEntity> GetUserAsync(long userId, bool asNoTracking, CancellationToken cancellationToken)
        {
            var user = await _applicationUnitOfWork.UserRepository.GetByIdAsync(userId, asNoTracking, cancellationToken: cancellationToken);

            if (user == null)
            {
                throw new KeyNotFoundException($"User {userId} was not found.");
            }

            return user;
        }

        private static UserAdministrationListItemModel ToListItemModel(UserEntity user)
        {
            return new UserAdministrationListItemModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsActive = user.IsActive,
                DeletedAt = user.DeletedAt,
                UserRole = user.UserRole,
            };
        }

        private static UserAdministrationDetailsModel ToDetailsModel(UserEntity user)
        {
            return new UserAdministrationDetailsModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsActive = user.IsActive,
                DeletedAt = user.DeletedAt,
                UserRole = user.UserRole,
                CreatedAt = user.CreatedAt,
            };
        }
    }
}
