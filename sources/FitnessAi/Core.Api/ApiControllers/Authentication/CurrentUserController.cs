using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Models.Authentication;

namespace Core.Api.ApiControllers.Authentication
{
    public class CurrentUserController : ApiControllerBase
    {
        private readonly IUserService _userService;

        public CurrentUserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet(Name = "GetCurrentUser")]
        public async Task<UserExportModel?> GetCurrentUser()
        {
            return await _userService.GetCurrentUserAsync();
        }
    }
}
