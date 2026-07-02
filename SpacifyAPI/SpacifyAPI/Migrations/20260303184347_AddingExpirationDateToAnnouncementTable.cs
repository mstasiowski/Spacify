using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpacifyAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddingExpirationDateToAnnouncementTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpirationDate",
                table: "Announcements",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpirationDate",
                table: "Announcements");
        }
    }
}
