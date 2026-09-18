using AiUnitTests.Fakes;
using Data.Database.Entities.User;
using Logic.Services.UserAdministration;
using Shared.Enums.Authentication;

namespace AiUnitTests.Services
{
    public class UserAdministrationServiceTests
    {
        private const long CurrentUserId = 1;
        private const long OtherUserId = 2;

        [Fact]
        public async Task GetUsersAsync_ReturnsAllUsersIncludingSoftDeleted()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            unitOfWork.User.Items.Add(CreateUser(CurrentUserId));
            unitOfWork.User.Items.Add(CreateUser(OtherUserId, deletedAt: DateTime.UtcNow));

            var service = CreateService(unitOfWork);

            var users = await service.GetUsersAsync();

            Assert.Equal(2, users.Count);
        }

        [Fact]
        public async Task GetUserDetailsAsync_ThrowsWhenUserDoesNotExist()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetUserDetailsAsync(OtherUserId));
        }

        [Fact]
        public async Task UpdateUserRolesAsync_PersistsCombinedRoles()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var user = CreateUser(OtherUserId);
            unitOfWork.User.Items.Add(user);

            var service = CreateService(unitOfWork);

            await service.UpdateUserRolesAsync(OtherUserId, UserRoleEnum.UserRole | UserRoleEnum.AdminRole);

            Assert.Equal(UserRoleEnum.UserRole | UserRoleEnum.AdminRole, user.UserRole);
            Assert.Equal(1, unitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task UpdateUserRolesAsync_ThrowsWhenTargetingSelf()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            unitOfWork.User.Items.Add(CreateUser(CurrentUserId));

            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.UpdateUserRolesAsync(CurrentUserId, UserRoleEnum.AdminRole));
        }

        [Fact]
        public async Task UpdateActiveStateAsync_ThrowsWhenTargetingSelf()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            unitOfWork.User.Items.Add(CreateUser(CurrentUserId));

            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.UpdateActiveStateAsync(CurrentUserId, false));
        }

        [Fact]
        public async Task SoftDeleteUserAsync_SetsInactiveAndDeletedAt()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var user = CreateUser(OtherUserId);
            unitOfWork.User.Items.Add(user);

            var service = CreateService(unitOfWork);

            await service.SoftDeleteUserAsync(OtherUserId);

            Assert.False(user.IsActive);
            Assert.NotNull(user.DeletedAt);
        }

        [Fact]
        public async Task SoftDeleteUserAsync_ThrowsWhenTargetingSelf()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            unitOfWork.User.Items.Add(CreateUser(CurrentUserId));

            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<InvalidOperationException>(() => service.SoftDeleteUserAsync(CurrentUserId));
        }

        [Fact]
        public async Task RestoreUserAsync_ClearsDeletedAtAndReactivates()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var user = CreateUser(OtherUserId, deletedAt: DateTime.UtcNow);
            unitOfWork.User.Items.Add(user);

            var service = CreateService(unitOfWork);

            await service.RestoreUserAsync(OtherUserId);

            Assert.True(user.IsActive);
            Assert.Null(user.DeletedAt);
        }

        [Fact]
        public async Task PurgeSoftDeletedUsersAsync_DeletesOnlyUsersPastThirtyDays()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var overdueUser = CreateUser(OtherUserId, deletedAt: DateTime.UtcNow.AddDays(-31));
            var recentUser = CreateUser(CurrentUserId, deletedAt: DateTime.UtcNow.AddDays(-10));
            unitOfWork.User.Items.Add(overdueUser);
            unitOfWork.User.Items.Add(recentUser);

            var service = CreateService(unitOfWork);

            await service.PurgeSoftDeletedUsersAsync();

            Assert.DoesNotContain(overdueUser, unitOfWork.User.Items);
            Assert.Contains(recentUser, unitOfWork.User.Items);
        }

        private static UserAdministrationService CreateService(FakeApplicationUnitOfWork unitOfWork)
        {
            return new UserAdministrationService(unitOfWork, new FakeCurrentUserService { UserId = CurrentUserId });
        }

        private static UserEntity CreateUser(long id, DateTime? deletedAt = null)
        {
            return new UserEntity
            {
                Id = id,
                FirstName = "Jane",
                LastName = "Doe",
                Email = $"user{id}@example.com",
                AppId = Guid.NewGuid().ToString(),
                UserRole = UserRoleEnum.UserRole,
                IsActive = deletedAt == null,
                DeletedAt = deletedAt,
            };
        }
    }
}
