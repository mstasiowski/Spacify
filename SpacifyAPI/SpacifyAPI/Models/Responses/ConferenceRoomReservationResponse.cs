namespace SpacifyAPI.Models.Responses
{
    public class ConferenceRoomReservationResponse
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public int ConferenceRoomId { get; set; }
        public DateTimeOffset ReservationStart { get; set; }
        public DateTimeOffset ReservationEnd { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public bool IsConfirmed { get; set; }
    }
}
