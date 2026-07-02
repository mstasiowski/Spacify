using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class TagResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Color { get; set; }
    }
}
