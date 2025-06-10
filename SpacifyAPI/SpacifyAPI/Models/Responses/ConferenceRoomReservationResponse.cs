namespace SpacifyAPI.Models.Responses
{
    public class ConferenceRoomReservationResponse
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int ConferenceRoomId { get; set; }
        public DateTime ReservationStart { get; set; }
        public DateTime ReservationEnd { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsConfirmed { get; set; }
    }
}
