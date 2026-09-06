using Microsoft.AspNetCore.Authorization;

namespace Core.Api.AuthorizationAttributes
{
    public class MaintenanceUserAuthorizationHandler : AuthorizationHandler<MaintenanceUserAuthorizationRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, MaintenanceUserAuthorizationRequirement requirement)
        {
            var user = context.User;

            if (user.IsInRole(requirement.RequiredRole.ToString()))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;  
        }
    }
}
