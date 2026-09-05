using Data.Database;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Bundels
{
    public static class DbMigrator
    {
        public static async Task Migrate(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AIDbContext>();
            
            var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
            
            if (pendingMigrations.Any())
            {
                await dbContext.Database.MigrateAsync();
            }
        }
    }
}
