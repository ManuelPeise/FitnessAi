using Microsoft.AspNetCore.Authorization;
using Shared.Enums.Authentication;

namespace Core.Api.AuthorizationAttributes
{
    public class MaintenanceUserAuthorizationRequirement : IAuthorizationRequirement
    {
        public UserRoleEnum RequiredRole { get; } = UserRoleEnum.MaintenanceRole;

        public MaintenanceUserAuthorizationRequirement(UserRoleEnum requiredRole)
        {
            RequiredRole = requiredRole;
        }
    }
}
