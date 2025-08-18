namespace SpacifyAPI.Models.Responses
{
    public class UpcomingReservationResponse
    {
        public string Type { get; set; } 
        public int ResourceId { get; set; }
        public DateTimeOffset Start { get; set; }
        public DateTimeOffset End { get; set; }
        public bool IsConfirmed { get; set; }
    }
}
