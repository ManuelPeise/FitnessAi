using Logic.Services.Interfaces;
using Logic.Services.Seed;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.ApiControllers.Seed
{
    public class UserSeedController: ApiControllerBase
    {
        private IUserSeedService _userSeedService;
        public UserSeedController(IUserSeedService userSeedService)
        {
            _userSeedService = userSeedService;
        }


        [HttpPost(Name = "SeedUser")]
        public async Task<bool> SeedUser([FromBody] UserSeedModel model)
        {
            return await _userSeedService.SeedUser(model);
        }

        [HttpPost(Name = "SeedAdminUser")]
        public async Task<bool> SeedAdminUser([FromBody] UserSeedModel model)
        {
            return await _userSeedService.SeedAdminUser(model);
        }
    }
}
