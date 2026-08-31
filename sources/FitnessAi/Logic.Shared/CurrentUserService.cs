using Data.Accessor.Interfaces;
using Data.Database.Entities.User;
using Logic.Shared.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Logic.Shared
{
    public sealed class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        
        public CurrentUserService(
            IHttpContextAccessor httpContextAccessor,
            IApplicationUnitOfWork applicationUnitOfWork)
        {
            ArgumentNullException.ThrowIfNull(httpContextAccessor);

            _httpContextAccessor = httpContextAccessor;
            _applicationUnitOfWork = applicationUnitOfWork;
        }

        public bool IsAuthenticated =>
            _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated
            ?? false;

        public long UserId
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;

                if (user?.Identity?.IsAuthenticated != true)
                {
                    throw new UnauthorizedAccessException(
                        "No authenticated user is available.");
                }

                var userIdClaim =
                    user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

                if (!long.TryParse(userIdClaim, out var userId))
                {
                    throw new UnauthorizedAccessException(
                        "The authenticated user does not contain a valid user id.");
                }

                return userId;
            }
        }

        public bool UserIsInRole(string role)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            
            if (user?.Identity?.IsAuthenticated != true)
            {
                throw new UnauthorizedAccessException(
                    "No authenticated user is available.");
            }

            return user.IsInRole(role);
        }

        public async Task<UserEntity> GetCurrentUser()
        {
            var userId = UserId;

            var user = await _applicationUnitOfWork.UserRepository.GetByIdAsync(userId, true);
            
            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "The authenticated user does not exist in the database.");
            }

            return user;
        }
    }
}
