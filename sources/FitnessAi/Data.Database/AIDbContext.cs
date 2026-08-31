using Data.Database.Entities.Ai;
using Data.Database.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace Data.Database
{
    public class AIDbContext : DbContext
    {
        public AIDbContext(DbContextOptions options) : base(options) { }

        public DbSet<UserEntity> UserTable => Set<UserEntity>();
        public DbSet<UserCredentialsEntity> UserCredentialsTable => Set<UserCredentialsEntity>();
        public DbSet<UserAiEntity> UserAiTable => Set<UserAiEntity>();
        public DbSet<RunningTrainingDataEntity> RunningTrainingDataTable => Set<RunningTrainingDataEntity>();


        override protected void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserEntity>()
                .HasOne(u => u.UserCredentials)
                .WithOne()
                .HasForeignKey<UserEntity>(u => u.CredentialsId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserEntity>()
                .HasOne(u => u.UserAi)
                .WithOne()
                .HasForeignKey<UserEntity>(u => u.UserAiId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
