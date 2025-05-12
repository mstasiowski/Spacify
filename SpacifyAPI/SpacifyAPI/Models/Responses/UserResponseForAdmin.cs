using SpacifyAPI.Entities;
using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class UserResponseForAdmin
    {
        public Guid Id { get; set; }
        [Required, StringLength(50)]
        public string Name { get; set; } = string.Empty;
        [Required, StringLength(50)]
        public string Surname { get; set; } = string.Empty;
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;
        [Required]
        public UserRole Role { get; set; } = UserRole.Employee;

        [Range(0, 5)]
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
