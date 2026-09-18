using Core.Api.AuthorizationAttributes;
using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;

namespace Core.Api.ApiControllers.Authentication
{
    public class UserAdministrationMaintenanceController : ApiControllerBase
    {
        private readonly IUserAdministrationService _userAdministrationService;

        public UserAdministrationMaintenanceController(IUserAdministrationService userAdministrationService)
        {
            _userAdministrationService = userAdministrationService;
        }

        [MaintenanceApiAuthentication(UserRoleEnum.MaintenanceRole)]
        [HttpPost(Name = "PurgeSoftDeletedUsers")]
        public async Task PurgeSoftDeletedUsers(CancellationToken cancellationToken = default)
        {
            await _userAdministrationService.PurgeSoftDeletedUsersAsync(cancellationToken);
        }
    }
}
