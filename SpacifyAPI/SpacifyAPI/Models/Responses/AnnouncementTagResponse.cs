using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class AnnouncementTagResponse
    {

        public int TagId { get; set; }
        public string Name { get; set; }
        public string Color { get; set; }

        public DateTime AssignedAt { get; set; }
        public int DisplayOrder { get; set; }
    }
}
