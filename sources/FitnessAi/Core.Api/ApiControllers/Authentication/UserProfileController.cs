using Core.Api.AuthorizationAttributes;
using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;
using Shared.Models.Authentication;

namespace Core.Api.ApiControllers.Authentication
{
    public class UserProfileController : ApiControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public UserProfileController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        [ApiAuthentication(UserRoleEnum.UserRole | UserRoleEnum.AdminRole)]
        [HttpGet(Name = "GetProfile")]
        public async Task<UserProfileModel> GetProfile(CancellationToken cancellationToken = default)
        {
            return await _userProfileService.GetProfileAsync(cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.UserRole | UserRoleEnum.AdminRole)]
        [HttpPut(Name = "UpdateProfile")]
        public async Task UpdateProfile([FromBody] UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
        {
            await _userProfileService.UpdateProfileAsync(request, cancellationToken);
        }

        [ApiAuthentication(UserRoleEnum.UserRole | UserRoleEnum.AdminRole)]
        [HttpPut(Name = "ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                await _userProfileService.ChangePasswordAsync(request, cancellationToken);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }
    }
}
