using SpacifyAPI.Entities;
using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class UserResponseForAdmin
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? Role { get; set; }

        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? AccountBlockedUntil { get; set; } = null;

        public bool IsBlocked { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        //public List<WorkstationReservation>? WorkstationReservations { get; set; } = new List<WorkstationReservation>();
        //public List<ConferenceRoomReservation>? ConferenceRoomReservations { get; set; } = new List<ConferenceRoomReservation>();
    }
}
