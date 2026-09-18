using Core.Api.AuthorizationAttributes;
using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;
using Shared.Models.Authentication;

namespace Core.Api.ApiControllers.Authentication
{
    public class UserAdministrationController : ApiControllerBase
    {
        private readonly IUserAdministrationService _userAdministrationService;

        public UserAdministrationController(IUserAdministrationService userAdministrationService)
        {
            _userAdministrationService = userAdministrationService;
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpGet(Name = "GetUsers")]
        public async Task<IReadOnlyList<UserAdministrationListItemModel>> GetUsers(CancellationToken cancellationToken = default)
        {
            return await _userAdministrationService.GetUsersAsync(cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpGet(Name = "GetUserDetails")]
        public async Task<UserAdministrationDetailsModel> GetUserDetails([FromQuery] long id, CancellationToken cancellationToken = default)
        {
            return await _userAdministrationService.GetUserDetailsAsync(id, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpPut(Name = "UpdateUserRoles")]
        public async Task<IActionResult> UpdateUserRoles([FromQuery] long id, [FromBody] UpdateUserRolesRequest request, CancellationToken cancellationToken = default)
        {
            return await ExecuteGuardedAsync(() => _userAdministrationService.UpdateUserRolesAsync(id, request.UserRole, cancellationToken));
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpPut(Name = "UpdateActiveState")]
        public async Task<IActionResult> UpdateActiveState([FromQuery] long id, [FromBody] UpdateUserActiveStateRequest request, CancellationToken cancellationToken = default)
        {
            return await ExecuteGuardedAsync(() => _userAdministrationService.UpdateActiveStateAsync(id, request.IsActive, cancellationToken));
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpDelete(Name = "SoftDeleteUser")]
        public async Task<IActionResult> SoftDeleteUser([FromQuery] long id, CancellationToken cancellationToken = default)
        {
            return await ExecuteGuardedAsync(() => _userAdministrationService.SoftDeleteUserAsync(id, cancellationToken));
        }

        [ApiAuthentication(UserRoleEnum.AdminRole)]
        [HttpPut(Name = "RestoreUser")]
        public async Task<IActionResult> RestoreUser([FromQuery] long id, CancellationToken cancellationToken = default)
        {
            return await ExecuteGuardedAsync(() => _userAdministrationService.RestoreUserAsync(id, cancellationToken));
        }

        private async Task<IActionResult> ExecuteGuardedAsync(Func<Task> action)
        {
            try
            {
                await action();
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}
