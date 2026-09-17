using Logic.Services.Interfaces;
using Logic.Services.Seed;
using Microsoft.Extensions.Options;
using Shared.Models.Authentication;

namespace Core.Api.Bundels
{
    public static class DefaultAdminUserSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var options = scope.ServiceProvider.GetRequiredService<IOptions<DefaultAdminUserOptions>>().Value;

            if (string.IsNullOrWhiteSpace(options.Email) || string.IsNullOrWhiteSpace(options.Password))
            {
                return;
            }

            var userSeedService = scope.ServiceProvider.GetRequiredService<IUserSeedService>();

            await userSeedService.SeedAdminUser(new UserSeedModel
            {
                FirstName = options.FirstName,
                LastName = options.LastName,
                Email = options.Email,
                Password = options.Password,
            });
        }
    }
}
