namespace SpacifyAPI.Models.Requests
{
    public class ModifyAnnouncementRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string? AllowedRoles { get; set; } 
        public List<AnnouncementTagRequest>? Tags { get; set; }
    }
}
