using Logic.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Shared.Enums.Authentication;

namespace Core.Api.AuthorizationAttributes
{
    public sealed class ApiAuthorizationHandler
    : AuthorizationHandler<ApiAuthorizationRequirement>
    {
        private readonly ICurrentUserService _currentUserService;

        public ApiAuthorizationHandler(
            ICurrentUserService currentUserService)
        {
            ArgumentNullException.ThrowIfNull(currentUserService);

            _currentUserService = currentUserService;
        }

        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            ApiAuthorizationRequirement requirement)
        {
            if (!_currentUserService.IsAuthenticated)
            {
                return Task.CompletedTask;
            }
 
            if (HasAnyRequiredRole(requirement.RequiredRole))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }

        private bool HasAnyRequiredRole(UserRoleEnum requiredRole)
        {
            return Enum.GetValues<UserRoleEnum>()
                .Where(role => role != UserRoleEnum.None && requiredRole.HasFlag(role))
                .Any(role => _currentUserService.UserIsInRole(role.ToString()));
        }
    }
}
