using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Entities;
using SpacifyAPI.Helpers;

namespace SpacifyAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ConferenceRoomReservationController : ControllerBase
    {

        [Authorize(Roles = $"{RoleNames.Administrator},{RoleNames.Leader}")]
        [HttpGet("/conferenceRoomReservations")]
        public async Task<string> GetAllConferenceRoomReservations()
        {

            return "Rezerwacje sal konferencyjnych";
        }
    }
}
