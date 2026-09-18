using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAdministrationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "UserTable",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "UserTable",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            // UserRoleEnum was renumbered from UserRole=0/AdminRole=1/MaintenanceRole=2
            // to a [Flags] enum None=0/UserRole=1/AdminRole=2/MaintenanceRole=4 to support
            // multiple roles per user. Remap already-persisted values accordingly.
            migrationBuilder.Sql(
                "UPDATE UserTable SET UserRole = CASE UserRole " +
                "WHEN 0 THEN 1 " +
                "WHEN 1 THEN 2 " +
                "WHEN 2 THEN 4 " +
                "ELSE UserRole END;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE UserTable SET UserRole = CASE UserRole " +
                "WHEN 1 THEN 0 " +
                "WHEN 2 THEN 1 " +
                "WHEN 4 THEN 2 " +
                "ELSE UserRole END;");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "UserTable");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "UserTable");
        }
    }
}
