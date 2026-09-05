using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace Data.Database
{
    public class AIDbContext : DbContext
    {
        public AIDbContext(DbContextOptions options) : base(options) { }

        public DbSet<UserEntity> UserTable => Set<UserEntity>();
        public DbSet<UserCredentialsEntity> UserCredentialsTable => Set<UserCredentialsEntity>();
        public DbSet<RunningTrainingDataEntity> RunningTrainingDataTable => Set<RunningTrainingDataEntity>();
        public DbSet<HealthConnectDataEntity> HealthConnectDataTable => Set<HealthConnectDataEntity>();

        override protected void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserEntity>()
                .HasOne(u => u.UserCredentials)
                .WithOne()
                .HasForeignKey<UserEntity>(u => u.CredentialsId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<UserEntity>()
                .HasMany(u => u.HealthData)
                .WithOne(h => h.User)
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
