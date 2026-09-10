using Data.Database.Entities.HealthConnect;
using Microsoft.EntityFrameworkCore;
using Shared.Enums.HealthConnect;

namespace Data.Database.Seeds
{
    public class HealthConnectUnitTypeSeed : IEntityTypeConfiguration<HealthConnectUnitEntity>
    {
        public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<HealthConnectUnitEntity> builder)
        {
            var timeStamp = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc);
            var user = "System";

            builder.HasData(
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.BeatsPerMinute, UnitType = HealthConnectUnitTypeEnum.BeatsPerMinute, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.BreathsPerMinute, UnitType = HealthConnectUnitTypeEnum.BreathsPerMinute, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.StepsPerMinute, UnitType = HealthConnectUnitTypeEnum.StepsPerMinute, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.RevolutionsPerMinute, UnitType = HealthConnectUnitTypeEnum.RevolutionsPerMinute, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Percent, UnitType = HealthConnectUnitTypeEnum.Percent, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Count, UnitType = HealthConnectUnitTypeEnum.Count, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Milliseconds, UnitType = HealthConnectUnitTypeEnum.Milliseconds, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Seconds, UnitType = HealthConnectUnitTypeEnum.Seconds, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Minutes, UnitType = HealthConnectUnitTypeEnum.Minutes, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.MillilitersPerKilogramPerMinute, UnitType = HealthConnectUnitTypeEnum.MillilitersPerKilogramPerMinute, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.KilocaloriesPerDay, UnitType = HealthConnectUnitTypeEnum.KilocaloriesPerDay, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Grams, UnitType = HealthConnectUnitTypeEnum.Grams, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Kilograms, UnitType = HealthConnectUnitTypeEnum.Kilograms, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Milligrams, UnitType = HealthConnectUnitTypeEnum.Milligrams, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Micrograms, UnitType = HealthConnectUnitTypeEnum.Micrograms, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Ounces, UnitType = HealthConnectUnitTypeEnum.Ounces, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Pounds, UnitType = HealthConnectUnitTypeEnum.Pounds, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Liters, UnitType = HealthConnectUnitTypeEnum.Liters, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Milliliters, UnitType = HealthConnectUnitTypeEnum.Milliliters, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.FluidOuncesUs, UnitType = HealthConnectUnitTypeEnum.FluidOuncesUs, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.MillimetersOfMercury, UnitType = HealthConnectUnitTypeEnum.MillimetersOfMercury, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.MillimolesPerLiter, UnitType = HealthConnectUnitTypeEnum.MillimolesPerLiter, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.MilligramsPerDeciliter, UnitType = HealthConnectUnitTypeEnum.MilligramsPerDeciliter, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Watts, UnitType = HealthConnectUnitTypeEnum.Watts, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Kilowatts, UnitType = HealthConnectUnitTypeEnum.Kilowatts, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.MetersPerSecond, UnitType = HealthConnectUnitTypeEnum.MetersPerSecond, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.KilometersPerHour, UnitType = HealthConnectUnitTypeEnum.KilometersPerHour, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.MilesPerHour, UnitType = HealthConnectUnitTypeEnum.MilesPerHour, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Celsius, UnitType = HealthConnectUnitTypeEnum.Celsius, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Fahrenheit, UnitType = HealthConnectUnitTypeEnum.Fahrenheit, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Kelvin, UnitType = HealthConnectUnitTypeEnum.Kelvin, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Calories, UnitType = HealthConnectUnitTypeEnum.Calories, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Kilocalories, UnitType = HealthConnectUnitTypeEnum.Kilocalories, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Joules, UnitType = HealthConnectUnitTypeEnum.Joules, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Kilojoules, UnitType = HealthConnectUnitTypeEnum.Kilojoules, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Millimeters, UnitType =            HealthConnectUnitTypeEnum.Millimeters, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Centimeters, UnitType = HealthConnectUnitTypeEnum.Centimeters, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Meters, UnitType = HealthConnectUnitTypeEnum.Meters, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Kilometers, UnitType = HealthConnectUnitTypeEnum.Kilometers, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Inches, UnitType = HealthConnectUnitTypeEnum.Inches, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Feet, UnitType = HealthConnectUnitTypeEnum.Feet, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user },
                new HealthConnectUnitEntity { Id = (long)HealthConnectUnitTypeEnum.Miles, UnitType = HealthConnectUnitTypeEnum.Miles, CreatedAt = timeStamp, UpdatedAt = timeStamp, CreatedBy = user, UpdatedBy = user });
        }
    }
}
