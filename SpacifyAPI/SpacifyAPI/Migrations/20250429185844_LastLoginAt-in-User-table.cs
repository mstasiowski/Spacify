using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpacifyAPI.Migrations
{
    /// <inheritdoc />
    public partial class LastLoginAtinUsertable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastFailedLoginAt",
                table: "Users",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastFailedLoginAt",
                table: "Users");
        }
    }
}
