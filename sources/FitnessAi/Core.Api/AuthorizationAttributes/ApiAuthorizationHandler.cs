using Logic.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;

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
 
            if (_currentUserService.UserIsInRole(requirement.RequiredRole.ToString()))
            {
                context.Succeed(requirement);
            }

            if (_currentUserService.UserId <= 0)
            {
                return Task.CompletedTask;
            }

            context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
