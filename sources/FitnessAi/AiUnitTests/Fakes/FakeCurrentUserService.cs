using Data.Database.Entities.User;
using Logic.Shared.Interfaces;

namespace AiUnitTests.Fakes
{
    internal class FakeCurrentUserService : ICurrentUserService
    {
        public long UserId { get; set; } = 1;
        public bool IsAuthenticated => true;

        public Task<UserEntity> GetCurrentUser() => throw new NotImplementedException();
        public bool UserIsInRole(string role) => true;
    }
}
