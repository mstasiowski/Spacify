using SpacifyAPI.Entities;
using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class UserResponseForAdmin
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }

        public int FailedLoginAttempts { get; set; }
        public DateTimeOffset? AccountBlockedUntil { get; set; }

        public bool IsBlocked { get; set; } = false;

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public DateTimeOffset? LastLoginAt { get; set; }

        //public List<WorkstationReservation>? WorkstationReservations { get; set; } = new List<WorkstationReservation>();
        //public List<ConferenceRoomReservation>? ConferenceRoomReservations { get; set; } = new List<ConferenceRoomReservation>();
    }
}
