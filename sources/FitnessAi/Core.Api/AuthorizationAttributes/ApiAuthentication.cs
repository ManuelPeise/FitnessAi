using Microsoft.AspNetCore.Authorization;
using Shared.Enums.Authentication;

namespace Core.Api.AuthorizationAttributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true,Inherited = true)]
    public sealed class ApiAuthentication : AuthorizeAttribute, IAuthorizationRequirementData
    {
        public UserRoleEnum UserRole { get; }

        public ApiAuthentication(UserRoleEnum userRole)
        {
            UserRole = userRole;
        }

        public IEnumerable<IAuthorizationRequirement> GetRequirements()
        {
            yield return new ApiAuthorizationRequirement(UserRole);
        }
    }
}
