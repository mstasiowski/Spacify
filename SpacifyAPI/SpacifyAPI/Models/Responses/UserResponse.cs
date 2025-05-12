using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;


        //public List<WorkstationReservation>? WorkstationReservations { get; set; } = new List<WorkstationReservation>();
        //public List<ConferenceRoomReservation>? ConferenceRoomReservations { get; set; } = new List<ConferenceRoomReservation>();
    }
}
