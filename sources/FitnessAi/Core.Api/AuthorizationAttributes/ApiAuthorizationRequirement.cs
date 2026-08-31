using Microsoft.AspNetCore.Authorization;
using Shared.Enums.Authentication;

namespace Core.Api.AuthorizationAttributes
{
    public sealed class ApiAuthorizationRequirement: IAuthorizationRequirement
    {
        public UserRoleEnum RequiredRole { get; } = UserRoleEnum.UserRole;

        public ApiAuthorizationRequirement(UserRoleEnum requiredRole)
        {
            RequiredRole = requiredRole;
        }
    }
}
