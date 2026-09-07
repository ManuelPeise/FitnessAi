using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

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
                name: "RunningTrainingDataTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ExcerciseId = table.Column<string>(type: "longtext", nullable: false),
                    ExerciseType = table.Column<int>(type: "int", nullable: false),
                    StartTimeStamp = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTimeStamp = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DistanceInMeters = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Steps = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Vo2Max = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LeanBodyMass = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxHeartRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinHeartRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ElevationGain = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CaloriesBurned = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BodyFat = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OxygenSaturationAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RespiratoryRatePerMinuteAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HeartRateAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StepsCadenceAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PowerAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SpeedAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CyclingPedalingCadenceAvg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RunningTrainingDataTable", x => x.Id);
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
                name: "UserTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    FirstName = table.Column<string>(type: "longtext", nullable: false),
                    LastName = table.Column<string>(type: "longtext", nullable: false),
                    Email = table.Column<string>(type: "longtext", nullable: false),
                    AppId = table.Column<string>(type: "longtext", nullable: false),
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
                name: "HealthConnectDataTable",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ExerciseId = table.Column<string>(type: "longtext", nullable: true),
                    RecordId = table.Column<string>(type: "longtext", nullable: false),
                    Origin = table.Column<string>(type: "longtext", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<int>(type: "int", nullable: false),
                    ExerciseType = table.Column<int>(type: "int", nullable: true),
                    Value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StartTimestamp = table.Column<string>(type: "longtext", nullable: false),
                    EndTimestamp = table.Column<string>(type: "longtext", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthConnectDataTable", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthConnectDataTable_UserTable_UserId",
                        column: x => x.UserId,
                        principalTable: "UserTable",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_HealthConnectDataTable_UserId",
                table: "HealthConnectDataTable",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SettingsTable_AiSettingsId",
                table: "SettingsTable",
                column: "AiSettingsId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTable_CredentialsId",
                table: "UserTable",
                column: "CredentialsId",
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
                name: "HealthConnectDataTable");

            migrationBuilder.DropTable(
                name: "RunningTrainingDataTable");

            migrationBuilder.DropTable(
                name: "ScheduledJobsTable");

            migrationBuilder.DropTable(
                name: "UserTable");

            migrationBuilder.DropTable(
                name: "SettingsTable");

            migrationBuilder.DropTable(
                name: "UserCredentialsTable");

            migrationBuilder.DropTable(
                name: "AiSettingsTable");
        }
    }
}
