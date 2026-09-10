using Data.Database.Entities.Ai;
using Data.Database.Entities.HealthConnect;
using Data.Database.Entities.Scheduler;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;
using Data.Database.Seeds;
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
        public DbSet<HealthConnectUnitEntity> HealthConnectUnitTable => Set<HealthConnectUnitEntity>();
        public DbSet<HealthConnectAvgEntity> HealthConnectAvgTable => Set<HealthConnectAvgEntity>();
        public DbSet<HealthConnectBloodPressureEntity> HealthConnectBloodPressureTable => Set<HealthConnectBloodPressureEntity>();
        public DbSet<HealthConnectValuesEntity> HealthConnectValuesTable => Set<HealthConnectValuesEntity>();
        public DbSet<HealthConnectHealthDataEntity> HealthConnectHealthDataTable => Set<HealthConnectHealthDataEntity>();
        public DbSet<HealthConnectTimeZoneEntity> HealthConnectTimeZoneTable => Set<HealthConnectTimeZoneEntity>();
        public DbSet<HealthConnectTrainingDataEntity> HealthConnectTrainingDataTable => Set<HealthConnectTrainingDataEntity>();
        public DbSet<HealthConnectTrainingDataValuesEntity> HealthConnectTrainingDataValuesTable => Set<HealthConnectTrainingDataValuesEntity>();
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

            modelBuilder.Entity<UserEntity>()
              .HasMany(h => h.HealthData)
              .WithOne(h => h.User)
              .HasForeignKey(h => h.UserId)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserEntity>()
             .HasMany(h => h.TrainingData)
             .WithOne(h => h.User)
             .HasForeignKey(h => h.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SettingsEntity>()
                .HasOne(s => s.AiSettings)
                .WithOne()
                .HasForeignKey<SettingsEntity>(s => s.AiSettingsId)
                .OnDelete(DeleteBehavior.Cascade);

          
            ConfigureHealthConnect(modelBuilder);
        }

        private static void ConfigureHealthConnect(ModelBuilder modelBuilder)
        {
            // HealthConnectAvgEntity
            modelBuilder.Entity<HealthConnectAvgEntity>()
                .HasOne(a => a.Values)
                .WithMany()
                .HasForeignKey(a => a.HealthConnectValuesId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectAvgEntity>()
                .HasOne(a => a.Unit)
                .WithMany()
                .HasForeignKey(a => a.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // HealthConnectBloodPressureEntity
            modelBuilder.Entity<HealthConnectBloodPressureEntity>()
                .HasOne(b => b.Values)
                .WithOne(v => v.BloodPressure)
                .HasForeignKey<HealthConnectBloodPressureEntity>(b => b.HealthConnectValuesId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectBloodPressureEntity>()
                .HasOne(b => b.Unit)
                .WithMany()
                .HasForeignKey(b => b.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // HealthConnectValuesEntity
            modelBuilder.Entity<HealthConnectValuesEntity>()
                .HasOne(v => v.HeartRate)
                .WithMany()
                .HasForeignKey(v => v.HeartRateId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectValuesEntity>()
                .HasOne(v => v.RestingHeartRate)
                .WithMany()
                .HasForeignKey(v => v.RestingHeartRateId)
                .OnDelete(DeleteBehavior.Restrict);

            // HealthConnectHealthDataEntity
            modelBuilder.Entity<HealthConnectHealthDataEntity>()
                .HasOne(h => h.Values)
                .WithOne(v => v.Record)
                .HasForeignKey<HealthConnectHealthDataEntity>(h => h.HealthConnectValuesId)
                .OnDelete(DeleteBehavior.Restrict);

            // HealthConnectTrainingDataEntity
            modelBuilder.Entity<HealthConnectTrainingDataEntity>()
                .HasOne(t => t.HealthConnectTimeZoneEntity)
                .WithMany()
                .HasForeignKey(t => t.HealthConnectTimeZoneEntityId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectTrainingDataEntity>()
                .HasOne(t => t.HealthConnectTrainingDataValues)
                .WithMany()
                .HasForeignKey(t => t.HealthConnectTrainingDataValuesId)
                .OnDelete(DeleteBehavior.Restrict);

            // HealthConnectTrainingDataValuesEntity
            modelBuilder.Entity<HealthConnectTrainingDataValuesEntity>()
                .HasOne(v => v.CyclingPedalingCadence)
                .WithMany()
                .HasForeignKey(v => v.CyclingPedalingCadenceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectTrainingDataValuesEntity>()
                .HasOne(v => v.HeartRate)
                .WithMany()
                .HasForeignKey(v => v.HeartRateId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectTrainingDataValuesEntity>()
                .HasOne(v => v.Power)
                .WithMany()
                .HasForeignKey(v => v.PowerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectTrainingDataValuesEntity>()
                .HasOne(v => v.Speed)
                .WithMany()
                .HasForeignKey(v => v.SpeedId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectTrainingDataValuesEntity>()
                .HasOne(v => v.RestingHeartRate)
                .WithMany()
                .HasForeignKey(v => v.RestingHeartRateId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HealthConnectTrainingDataValuesEntity>()
                .HasOne(v => v.StepCadence)
                .WithMany()
                .HasForeignKey(v => v.StepCadenceId)
                .OnDelete(DeleteBehavior.Restrict);

             modelBuilder.ApplyConfiguration(new HealthConnectUnitTypeSeed());
        }
    }
}
