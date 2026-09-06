using Microsoft.AspNetCore.Authorization;
using Shared.Enums.Authentication;

namespace Core.Api.AuthorizationAttributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class MaintenanceApiAuthentication : AuthorizeAttribute
    {
        public UserRoleEnum UserRole { get; }

        public MaintenanceApiAuthentication(UserRoleEnum userRole)
        {
            UserRole = userRole;
            Policy = AuthorizationPolicies.MaintenanceUserAuthentication;
        }
    }
}
