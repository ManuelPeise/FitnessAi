using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkoutIntensityToTrainingData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkoutIntensity",
                table: "HealthConnectTrainingDataTable",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkoutIntensity",
                table: "HealthConnectAiTrainingDataTable",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "WorkoutIntensityPredictedAt",
                table: "HealthConnectAiTrainingDataTable",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "AiModelTable",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkoutIntensity",
                table: "HealthConnectTrainingDataTable");

            migrationBuilder.DropColumn(
                name: "WorkoutIntensity",
                table: "HealthConnectAiTrainingDataTable");

            migrationBuilder.DropColumn(
                name: "WorkoutIntensityPredictedAt",
                table: "HealthConnectAiTrainingDataTable");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "AiModelTable",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
