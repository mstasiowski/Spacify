using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Helpers;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using SpacifyAPI.Services;
using System.Security.Claims;

namespace SpacifyAPI.Controllers
{
    [Route("conferenceroom/reservation")]
    [ApiController]
    public class ConferenceRoomReservationController : ControllerBase
    {

        private readonly IConferenceRoomReservationService _conferenceRoomReservationService;

        public ConferenceRoomReservationController(IConferenceRoomReservationService conferenceRoomReservationService)
        {
            _conferenceRoomReservationService = conferenceRoomReservationService;
        }

        [Authorize(Roles = $"{RoleNames.Administrator},{RoleNames.Leader}")]
        [HttpGet("/conferenceroom/reservations")]
        public async Task<ActionResult<List<ConferenceRoomReservationResponse>>> GetAllConferenceRoomReservations()
        {
            var dbReservations = await _conferenceRoomReservationService.GetAllConfRoomsReservationsAsync();

            return Ok(dbReservations);
        }

        [Authorize(Roles = $"{RoleNames.Administrator},{RoleNames.Leader}")]
        [HttpGet("{reservationId}")]
        public async Task<ActionResult<ConferenceRoomReservationResponse>> GetConferenceRoomReservationById(int reservationId)
        {
            var dbReservation = await _conferenceRoomReservationService.GetConfRoomReservationByIdAsync(reservationId);

            return Ok(dbReservation);
        }

        [Authorize(Roles = $"{RoleNames.Administrator},{RoleNames.Leader}")]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<ConferenceRoomReservationResponse>>> GetUserConfRoomReservations(Guid userId)
        {
            var dbReservations = await _conferenceRoomReservationService
                .GetUserConfRoomReservationsAsync(userId);

            return Ok(dbReservations);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<WorkstationReservationResponse>> CreateConfRoomReservation(CreateConferenceRoomReservationRequest reservationRequest)
        {
            var dbReservation = await _conferenceRoomReservationService.CreateConfRoomReservationAsync(reservationRequest);
            return CreatedAtAction(nameof(CreateConfRoomReservation), new { reservationId = dbReservation.Id }, dbReservation);
        }

        [Authorize]
        [HttpPut("{reservationId}")]
        public async Task<ActionResult<WorkstationReservationResponse>> UpdateConfRoomReservation(int reservationId, ModifyConfRoomReservationRequest reservation)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessToDataException("User ID not found in token.");
            }

            var userId = Guid.Parse(userIdClaim);
            var isAdmin = User.IsInRole(RoleNames.Administrator);
            var existingReservation = await _conferenceRoomReservationService.GetConfRoomReservationByIdAsync(reservationId);

            if (existingReservation == null)
            {
                throw new NotFoundException("Reservation not found.");
            }

            if (!isAdmin && existingReservation.UserId != userId)
            {
                throw new ForbiddenAccessToData("You do not have permission to modify this reservation.");
            }


            var dbConfReservation = await _conferenceRoomReservationService.UpdateConfRoomReservationAsync(reservationId, reservation);
            return Ok(dbConfReservation);
        }

        [Authorize]
        [HttpDelete("{reservationId}")]
        public async Task<ActionResult> DeleteConfRoomsReservation(int reservationId)
        {
            await _conferenceRoomReservationService.DeleteConfRoomsReservationAsync(reservationId);
            return NoContent();
        }

        [Authorize]
        [HttpPatch("{reservationId}/confirm")]
        public async Task<ActionResult<ConferenceRoomReservationResponse>> ConfirmConfRoomReservation(int reservationId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

            var dbConfReservation = await _conferenceRoomReservationService.ConfirmConfRoomReservationAsync(reservationId, userId);
            return Ok(dbConfReservation);
        }

    }
}
