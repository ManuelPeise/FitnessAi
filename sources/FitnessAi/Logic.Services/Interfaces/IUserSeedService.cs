using Logic.Services.Seed;

namespace Logic.Services.Interfaces
{
    public interface IUserSeedService
    {
        Task<bool> SeedUser(UserSeedModel userSeedModel);
        Task<bool> SeedAdminUser(UserSeedModel userSeedModel);
    }
}
