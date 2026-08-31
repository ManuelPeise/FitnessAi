using Microsoft.AspNetCore.Authorization;
using Shared.Enums.Authentication;

namespace Core.Api.AuthorizationAttributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true,Inherited = true)]
    public sealed class ApiAuthentication : AuthorizeAttribute
    {
        public UserRoleEnum UserRole { get; }

        public ApiAuthentication(UserRoleEnum userRole)
        {
            UserRole = userRole;
            Policy = AuthorizationPolicies.ApiAuthentication;
        }

    }
}
