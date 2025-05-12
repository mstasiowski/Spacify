using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class WorkstationReservationResponse
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int WorkstationId { get; set; }
        public DateTime ReservationStart { get; set; }
        public DateTime ReservationEnd { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsConfirmed { get; set; } = false;
    }
}
