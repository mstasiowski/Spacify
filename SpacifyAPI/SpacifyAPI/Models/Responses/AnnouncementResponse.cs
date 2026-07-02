using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class AnnouncementResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAt { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public string AllowedRoles { get; set; }

        public Guid AuthorId { get; set; }
        public UserResponse? Author { get; set; }

        //public List<TagResponse> Tags { get; set; } = new List<TagResponse>();
        public List<AnnouncementTagResponse> Tags { get; set; } = new List<AnnouncementTagResponse>();
    }
}
