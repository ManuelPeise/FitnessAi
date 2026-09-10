using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Scheduler;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;
using Microsoft.EntityFrameworkCore;

namespace Data.Database
{
    public class AIDbContext : DbContext
    {
        public AIDbContext(DbContextOptions options) : base(options) { }

        // user tables
        public DbSet<UserEntity> UserTable => Set<UserEntity>();
        public DbSet<UserCredentialsEntity> UserCredentialsTable => Set<UserCredentialsEntity>();
        // health connect tables
        public DbSet<HealthConnectRecordEntity> HealthConnectRecordTable => Set<HealthConnectRecordEntity>();
        public DbSet<HealthConnectValueEntity> HealthConnectValueTable => Set<HealthConnectValueEntity>();
        public DbSet<HealthConnectSegmentEntity> HealthConnectSegmentTable => Set<HealthConnectSegmentEntity>();
        // settings tables
        public DbSet<SettingsEntity> SettingsTable => Set<SettingsEntity>();
        public DbSet<AISettingsEntity> AiSettingsTable => Set<AISettingsEntity>();
        // scheduler tables
        public DbSet<ScheduledJobEntity> ScheduledJobsTable => Set<ScheduledJobEntity>();
        // ai training data tables
        public DbSet<HealthConnectRunningAiTrainingDataEntity> HealthConnectRunningAiTrainingDataTable => Set<HealthConnectRunningAiTrainingDataEntity>();

        override protected void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserEntity>()
                .HasOne(u => u.UserCredentials)
                .WithOne()
                .HasForeignKey<UserEntity>(u => u.CredentialsId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<UserEntity>()
                .HasOne(u => u.Settings)
                .WithOne()
                .HasForeignKey<UserEntity>(u => u.SettingsId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SettingsEntity>()
                .HasOne(s => s.AiSettings)
                .WithOne()
                .HasForeignKey<SettingsEntity>(s => s.AiSettingsId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
