using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class WorkstationReservationResponse
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int WorkstationId { get; set; }
        public DateTimeOffset ReservationStart { get; set; }
        public DateTimeOffset ReservationEnd { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public bool IsConfirmed { get; set; }
    }
}
