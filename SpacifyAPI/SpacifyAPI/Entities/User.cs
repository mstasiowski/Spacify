using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
   
    public class User
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
        [Required, StringLength(100)]
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        public UserRole Role { get; set; } = UserRole.Employee;
        public string? RefreshToken { get; set; }
        public DateTimeOffset? RefreshTokenExpirationTime { get; set; }

        [Range(0, 5)]
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTimeOffset? AccountBlockedUntil { get; set; } = null;

        public bool IsBlocked { get; set; } = false;

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
        public DateTimeOffset? LastLoginAt { get; set; }
        public DateTimeOffset? LastFailedLoginAt { get; set; }

        public List<WorkstationReservation>? WorkstationReservations { get; set; } = new List<WorkstationReservation>();
        public List<ConferenceRoomReservation>? ConferenceRoomReservations { get; set; } = new List<ConferenceRoomReservation>();

    }
}
