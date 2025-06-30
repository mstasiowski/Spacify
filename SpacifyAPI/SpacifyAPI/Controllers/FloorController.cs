using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Helpers;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using System.Security.Claims;

namespace SpacifyAPI.Controllers
{
    [Route("floor")]
    [ApiController]
    public class FloorController : ControllerBase
    {
        private readonly IFloorService _floorService;

        public FloorController(IFloorService service)
        {
            _floorService = service;
        }

        [Authorize]
        [HttpGet("/floors")]
        public async Task<ActionResult<List<FloorResponse>>> GetFloors()
        {
            var floors = await _floorService.GetAllFloorsAsync();
            return Ok(floors);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<FloorResponse>> GetFloor(int id)
        {  
            var floor = await _floorService.GetFloorByIdAsync(id);
            return Ok(floor);
        }

        [Authorize]
        [HttpGet("/floors/user-reservations")]
        public async Task<ActionResult<List<FloorResponse>>> GetFloorsWithUserReservations()
        {

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessToDataException("User ID not found in token.");
            }

            var floors = await _floorService.GetAllFloorsWithUserReservationsAsync(userIdClaim);
            return Ok(floors);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPost]
        public async Task<ActionResult<FloorResponse>> CreateFloor(CreateFloorRequest floor)
        {
            var newFloor = await _floorService.CreateFloorAsync(floor);
            return CreatedAtAction(nameof(CreateFloor), new { id = newFloor.Id }, newFloor);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPut("{id}")]
        public async Task<ActionResult<FloorResponse>> UpdateFloor(int id, [FromBody] CreateFloorRequest updateFloor)
        {
            var updatedFloor = await _floorService.UpdateFloorAsync(id, updateFloor);
            return Ok(updatedFloor);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteFloor(int id)
        {
            await _floorService.DeleteFloorAsync(id);
            return NoContent();
        }

    }
}
