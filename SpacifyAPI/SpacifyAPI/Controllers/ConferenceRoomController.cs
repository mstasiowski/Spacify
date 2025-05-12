using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Entities;
using SpacifyAPI.Helpers;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Enums;
using SpacifyAPI.Models.Requests;

namespace SpacifyAPI.Controllers
{
    [Route("conferenceRoom")]
    [ApiController]
    public class ConferenceRoomController : ControllerBase
    {
        private readonly IConferenceRoomService _conferenceRoomService;

        public ConferenceRoomController(IConferenceRoomService service)
        {
            _conferenceRoomService = service;
        }

        [Authorize(Roles = $"{RoleNames.Administrator},{RoleNames.Leader}")]
        [HttpGet("/conferenceRooms")]
        public async Task<ActionResult<List<ConferenceRoom>>> GetAllConferenceRooms()
        {
            var dbConferenceRooms = await _conferenceRoomService.GetAllConferenceRoomsAsync();

            return Ok(dbConferenceRooms);
        }

        [Authorize(Roles = $"{RoleNames.Administrator},{RoleNames.Leader}")]
        [HttpGet("id")]
        public async Task<ActionResult<ConferenceRoom>> GetConferenceRoomById(int id)
        {
            var dbConferenceRoom = await _conferenceRoomService.GetConferenceRoomByIdAsync(id);

            return Ok(dbConferenceRoom);
        }

        [Authorize(Roles = $"{RoleNames.Administrator}")]
        [HttpPost]
        public async Task<ActionResult<ConferenceRoom>> CreateConferenceRoom(CreateConferenceRoomRequest conferenceRoom)
        {
            var newConferenceRoom = await _conferenceRoomService.CreateConferenceRoomAsync(conferenceRoom);

            return CreatedAtAction(nameof(CreateConferenceRoom), new { id = newConferenceRoom.Id }, newConferenceRoom);

        }

        [Authorize(Roles = $"{RoleNames.Administrator}")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ConferenceRoom>> UpdateConferenceRoom(int id, [FromBody] CreateConferenceRoomRequest updateConferenceRoom)
        {
            var updatedConferenceRoom = await _conferenceRoomService.UpdateConferenceRoomAsync(id, updateConferenceRoom);
            return Ok(updatedConferenceRoom);
        }

        [Authorize(Roles = $"{RoleNames.Administrator}")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteConferenceRoom(int id)
        {
            await _conferenceRoomService.DeleteConferenceRoomAsync(id);
            return NoContent();
        }

    }
}
