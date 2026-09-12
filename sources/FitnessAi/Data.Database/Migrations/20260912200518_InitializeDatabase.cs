using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Data.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitializeDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AiSettingsTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    CanUseHealthDataForAiTraining = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CanUseHealthDataAcceptedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CanUseHealthDataRejectedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiSettingsTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AiTrainingDataFileTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    AiType = table.Column<int>(type: "int", nullable: false),
                    Csv = table.Column<byte[]>(type: "longblob", nullable: false),
                    IsUpdated = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiTrainingDataFileTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectTimeZoneTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Offset = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectTimeZoneTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectUnitTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UnitType = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectUnitTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NutritionValuesTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    CaloriesKcal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ProteinGrams = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CarbohydratesGrams = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FatGrams = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FiberGrams = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SugarGrams = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionValuesTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ScheduledJobsTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: false),
                    RequestModelJson = table.Column<string>(type: "longtext", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FailedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ErrorMessage = table.Column<string>(type: "longtext", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledJobsTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserCredentialsTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false),
                    RefreshToken = table.Column<string>(type: "longtext", nullable: true),
                    RefreshTokenExpiresAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCredentialsTable", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SettingsTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    AiSettingsId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SettingsTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SettingsTable_AiSettingsTable_AiSettingsId",
                        column: x => x.AiSettingsId,
                        principalTable: "AiSettingsTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectAvgTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Avg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Min = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Max = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    UnitId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectAvgTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectAvgTable_HealthConnectUnitTable_UnitId",
                        column: x => x.UnitId,
                        principalTable: "HealthConnectUnitTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    FirstName = table.Column<string>(type: "longtext", nullable: false),
                    LastName = table.Column<string>(type: "longtext", nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", nullable: false),
                    AppId = table.Column<string>(type: "varchar(255)", nullable: false),
                    UserRole = table.Column<int>(type: "int", nullable: false),
                    CredentialsId = table.Column<long>(type: "bigint", nullable: false),
                    SettingsId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTable_SettingsTable_SettingsId",
                        column: x => x.SettingsId,
                        principalTable: "SettingsTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTable_UserCredentialsTable_CredentialsId",
                        column: x => x.CredentialsId,
                        principalTable: "UserCredentialsTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectTrainingDataValuesTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ActiveCaloriesBurnedInKcal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DistanceInMeters = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DurationSeconds = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ElevationAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    HydrationAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Steps = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WeightAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BodyFatPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OxygenSaturationPercentageAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RespiratoryRateAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Vo2MaxMlPerMinKgAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Notes = table.Column<string>(type: "longtext", nullable: true),
                    CyclingPedalingCadenceId = table.Column<long>(type: "bigint", nullable: false),
                    HeartRateId = table.Column<long>(type: "bigint", nullable: false),
                    PowerId = table.Column<long>(type: "bigint", nullable: false),
                    SpeedId = table.Column<long>(type: "bigint", nullable: false),
                    RestingHeartRateId = table.Column<long>(type: "bigint", nullable: false),
                    StepCadenceId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectTrainingDataValuesTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataValuesTable_HealthConnectAvgTable_C~",
                        column: x => x.CyclingPedalingCadenceId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataValuesTable_HealthConnectAvgTable_H~",
                        column: x => x.HeartRateId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataValuesTable_HealthConnectAvgTable_P~",
                        column: x => x.PowerId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataValuesTable_HealthConnectAvgTable_R~",
                        column: x => x.RestingHeartRateId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataValuesTable_HealthConnectAvgTable_S~",
                        column: x => x.SpeedId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataValuesTable_HealthConnectAvgTable_~1",
                        column: x => x.StepCadenceId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectValuesTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ActiveCaloriesBurnedInKcal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalCaloriesBurnedInKcal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    HydrationAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Steps = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SleepDurationInSeconds = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FloorsClimbed = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BasalMetabolicRateInKcal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WheelchairPushes = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    HeightInMeters = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BodyFatPercentageAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OxygenSaturationPercentageAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RespiratoryRateAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Vo2MaxMlPerMinKgAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    HeartRateId = table.Column<long>(type: "bigint", nullable: false),
                    RestingHeartRateId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectValuesTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectValuesTable_HealthConnectAvgTable_HeartRateId",
                        column: x => x.HeartRateId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectValuesTable_HealthConnectAvgTable_RestingHeartR~",
                        column: x => x.RestingHeartRateId,
                        principalTable: "HealthConnectAvgTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NutritionDataTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    DataKey = table.Column<string>(type: "varchar(255)", nullable: false),
                    StartTime = table.Column<DateTimeOffset>(type: "datetime", nullable: false),
                    EndTime = table.Column<DateTimeOffset>(type: "datetime", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    NutritionValuesId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionDataTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NutritionDataTable_NutritionValuesTable_NutritionValuesId",
                        column: x => x.NutritionValuesId,
                        principalTable: "NutritionValuesTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NutritionDataTable_UserTable_UserId",
                        column: x => x.UserId,
                        principalTable: "UserTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserBodyDataTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Height = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CanUpdateWeightOnHealthDataImport = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    BodyFatPercentageAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CanUpdateBodyFatPercentageOnHealthDataImport = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Waist = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Abdomen = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ShoulderWidth = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBodyDataTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserBodyDataTable_UserTable_UserId",
                        column: x => x.UserId,
                        principalTable: "UserTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectLapEntity",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    LengthInMeters = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrainingDataValuesId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectLapEntity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectLapEntity_HealthConnectTrainingDataValuesTable_~",
                        column: x => x.TrainingDataValuesId,
                        principalTable: "HealthConnectTrainingDataValuesTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectSegmentEntity",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    SegmentType = table.Column<int>(type: "int", nullable: false),
                    Repetitions = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    TrainingDataValuesId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectSegmentEntity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectSegmentEntity_HealthConnectTrainingDataValuesTa~",
                        column: x => x.TrainingDataValuesId,
                        principalTable: "HealthConnectTrainingDataValuesTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectTrainingDataTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    DataKey = table.Column<string>(type: "varchar(255)", nullable: false),
                    Origin = table.Column<string>(type: "longtext", nullable: false),
                    System = table.Column<string>(type: "longtext", nullable: false),
                    ExerciseType = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AllowedForAiTraining = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    WorkoutIntensity = table.Column<int>(type: "int", nullable: true),
                    HealthConnectTimeZoneEntityId = table.Column<long>(type: "bigint", nullable: false),
                    HealthConnectTrainingDataValuesId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectTrainingDataTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataTable_HealthConnectTimeZoneTable_He~",
                        column: x => x.HealthConnectTimeZoneEntityId,
                        principalTable: "HealthConnectTimeZoneTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataTable_HealthConnectTrainingDataValu~",
                        column: x => x.HealthConnectTrainingDataValuesId,
                        principalTable: "HealthConnectTrainingDataValuesTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectTrainingDataTable_UserTable_UserId",
                        column: x => x.UserId,
                        principalTable: "UserTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectBloodPressureTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Systolic = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Diastolic = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    HealthConnectValuesId = table.Column<long>(type: "bigint", nullable: false),
                    UnitId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectBloodPressureTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectBloodPressureTable_HealthConnectUnitTable_UnitId",
                        column: x => x.UnitId,
                        principalTable: "HealthConnectUnitTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectBloodPressureTable_HealthConnectValuesTable_Hea~",
                        column: x => x.HealthConnectValuesId,
                        principalTable: "HealthConnectValuesTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HealthConnectHealthDataTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    DataKey = table.Column<string>(type: "varchar(255)", nullable: false),
                    TimeStamp = table.Column<DateTimeOffset>(type: "datetime", nullable: false),
                    StartTime = table.Column<DateTimeOffset>(type: "datetime", nullable: false),
                    EndTime = table.Column<DateTimeOffset>(type: "datetime", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    HealthConnectValuesId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectHealthDataTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectHealthDataTable_HealthConnectValuesTable_Health~",
                        column: x => x.HealthConnectValuesId,
                        principalTable: "HealthConnectValuesTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HealthConnectHealthDataTable_UserTable_UserId",
                        column: x => x.UserId,
                        principalTable: "UserTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.InsertData(
                table: "HealthConnectUnitTable",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "UnitType", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 1, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 2L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 2, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 3L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 3, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 4L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 4, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 5L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 5, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 6L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 6, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 7L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 7, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 8L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 8, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 9L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 9, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 10L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 10, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 11L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 11, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 12L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 12, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 13L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 13, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 14L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 14, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 15L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 15, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 16L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 16, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 17L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 17, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 18L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 18, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 19L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 19, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 20L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 20, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 21L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 21, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 22L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 22, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 23L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 23, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 24L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 24, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 25L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 25, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 26L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 26, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 27L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 27, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 28L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 28, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 29L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 29, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 30L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 30, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 31L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 31, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 32L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 32, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 33L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 33, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 34L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 34, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 35L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 35, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 36L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 36, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 37L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 37, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 38L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 38, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 39L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 39, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 40L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 40, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 41L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 41, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" },
                    { 42L, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", 42, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectAvgTable_UnitId",
                table: "HealthConnectAvgTable",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectBloodPressureTable_HealthConnectValuesId",
                table: "HealthConnectBloodPressureTable",
                column: "HealthConnectValuesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectBloodPressureTable_UnitId",
                table: "HealthConnectBloodPressureTable",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectHealthDataTable_DataKey",
                table: "HealthConnectHealthDataTable",
                column: "DataKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectHealthDataTable_HealthConnectValuesId",
                table: "HealthConnectHealthDataTable",
                column: "HealthConnectValuesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectHealthDataTable_UserId",
                table: "HealthConnectHealthDataTable",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectLapEntity_TrainingDataValuesId",
                table: "HealthConnectLapEntity",
                column: "TrainingDataValuesId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectSegmentEntity_TrainingDataValuesId",
                table: "HealthConnectSegmentEntity",
                column: "TrainingDataValuesId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataTable_DataKey",
                table: "HealthConnectTrainingDataTable",
                column: "DataKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataTable_HealthConnectTimeZoneEntityId",
                table: "HealthConnectTrainingDataTable",
                column: "HealthConnectTimeZoneEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataTable_HealthConnectTrainingDataValu~",
                table: "HealthConnectTrainingDataTable",
                column: "HealthConnectTrainingDataValuesId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataTable_UserId",
                table: "HealthConnectTrainingDataTable",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataValuesTable_CyclingPedalingCadenceId",
                table: "HealthConnectTrainingDataValuesTable",
                column: "CyclingPedalingCadenceId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataValuesTable_HeartRateId",
                table: "HealthConnectTrainingDataValuesTable",
                column: "HeartRateId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataValuesTable_PowerId",
                table: "HealthConnectTrainingDataValuesTable",
                column: "PowerId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataValuesTable_RestingHeartRateId",
                table: "HealthConnectTrainingDataValuesTable",
                column: "RestingHeartRateId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataValuesTable_SpeedId",
                table: "HealthConnectTrainingDataValuesTable",
                column: "SpeedId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectTrainingDataValuesTable_StepCadenceId",
                table: "HealthConnectTrainingDataValuesTable",
                column: "StepCadenceId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectValuesTable_HeartRateId",
                table: "HealthConnectValuesTable",
                column: "HeartRateId");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectValuesTable_RestingHeartRateId",
                table: "HealthConnectValuesTable",
                column: "RestingHeartRateId");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionDataTable_DataKey",
                table: "NutritionDataTable",
                column: "DataKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutritionDataTable_NutritionValuesId",
                table: "NutritionDataTable",
                column: "NutritionValuesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutritionDataTable_UserId",
                table: "NutritionDataTable",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledJobsTable_Status",
                table: "ScheduledJobsTable",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SettingsTable_AiSettingsId",
                table: "SettingsTable",
                column: "AiSettingsId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserBodyDataTable_UserId",
                table: "UserBodyDataTable",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTable_AppId",
                table: "UserTable",
                column: "AppId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTable_CredentialsId",
                table: "UserTable",
                column: "CredentialsId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTable_Email",
                table: "UserTable",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTable_SettingsId",
                table: "UserTable",
                column: "SettingsId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiTrainingDataFileTable");

            migrationBuilder.DropTable(
                name: "HealthConnectBloodPressureTable");

            migrationBuilder.DropTable(
                name: "HealthConnectHealthDataTable");

            migrationBuilder.DropTable(
                name: "HealthConnectLapEntity");

            migrationBuilder.DropTable(
                name: "HealthConnectSegmentEntity");

            migrationBuilder.DropTable(
                name: "HealthConnectTrainingDataTable");

            migrationBuilder.DropTable(
                name: "NutritionDataTable");

            migrationBuilder.DropTable(
                name: "ScheduledJobsTable");

            migrationBuilder.DropTable(
                name: "UserBodyDataTable");

            migrationBuilder.DropTable(
                name: "HealthConnectValuesTable");

            migrationBuilder.DropTable(
                name: "HealthConnectTimeZoneTable");

            migrationBuilder.DropTable(
                name: "HealthConnectTrainingDataValuesTable");

            migrationBuilder.DropTable(
                name: "NutritionValuesTable");

            migrationBuilder.DropTable(
                name: "UserTable");

            migrationBuilder.DropTable(
                name: "HealthConnectAvgTable");

            migrationBuilder.DropTable(
                name: "SettingsTable");

            migrationBuilder.DropTable(
                name: "UserCredentialsTable");

            migrationBuilder.DropTable(
                name: "HealthConnectUnitTable");

            migrationBuilder.DropTable(
                name: "AiSettingsTable");
        }
    }
}
