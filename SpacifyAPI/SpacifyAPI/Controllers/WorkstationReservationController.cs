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
    //[Route("[controller]")]
    [Route("workstation/reservation")]
    [ApiController]
    public class WorkstationReservationController : ControllerBase
    {
        private readonly IWorkstationReservationService _workstationReservationService;

        public WorkstationReservationController(IWorkstationReservationService workstationReservationService)
        {
            _workstationReservationService = workstationReservationService;
        }

        [Authorize]
        [HttpGet("/workstation/reservations")]
        public async Task<ActionResult<List<WorkstationReservationResponse>>> GetAllWorkstationReservations()
        {
            var dbWorkstationReservations = await _workstationReservationService.GetAllWorkstationReservationsAsync();
            return Ok(dbWorkstationReservations);
        }

        [Authorize]
        [HttpGet("{reservationId}")]
        public async Task<ActionResult<WorkstationReservationResponse>> GetWorkstationReservationById(int reservationId)
        {
            var dbWorkstationReservation = await _workstationReservationService.GetWorkstationReservationByIdAsync(reservationId);
            return Ok(dbWorkstationReservation);
        }

        [Authorize]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<WorkstationReservationResponse>>> GetWorkstationReservationsByUserId(Guid userId)
        {
            var dbWorkstationReservations = await _workstationReservationService.GetWorkstationReservationsByUserIdAsync(userId);
            return Ok(dbWorkstationReservations);
        }

        [Authorize]
        [HttpGet("date/{date}")]
        public async Task<ActionResult<List<WorkstationReservationResponse>>> GetWorkstationReservationsByDate(DateTime date)
        {
            var dbWorkstationReservations = await _workstationReservationService.GetWorkstationReservationsByDateAsync(date);
            return Ok(dbWorkstationReservations);
        }

        [Authorize]
        [HttpGet("daterange")]
        public async Task<ActionResult<List<WorkstationReservationResponse>>> GetReservationsByDateTimeRange(DateTime startDate, DateTime endDate)
        {
            var dbWorkstationReservations = await _workstationReservationService.GetReservationsByDateTimeRangeAsync(startDate, endDate);
            return Ok(dbWorkstationReservations);

        }

        [Authorize]
        [HttpGet("today")]
        public async Task<ActionResult<List<WorkstationReservationResponse>>> GetTodaysWorkstationReservations()
        {
            var dbWorkstationReservations = await _workstationReservationService.GetTodaysWorkstationReservationsAsync();
            return Ok(dbWorkstationReservations);
        }

        [Authorize]
        [HttpGet("/workstation/reservations/floor/{floorId}")]
        public async Task<ActionResult<List<WorkstationReservationResponse>>> GetWorkstationReservationByFloorAndDate(int floorId, [FromQuery] DateTime date)
        {
            var dbReservation = await _workstationReservationService.GetWorkstationReservationsByFloorAndDateAsync(floorId, date);
            return Ok(dbReservation);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<WorkstationReservationResponse>> CreateWorkstationReservation(CreateWorkstationReservationRequest reservation)
        {
            var dbWorkstationReservation = await _workstationReservationService.CreateWorkstationReservationAsync(reservation);
            return CreatedAtAction(nameof(GetWorkstationReservationById), new { reservationId = dbWorkstationReservation.Id }, dbWorkstationReservation);
        }

        [Authorize]
        [HttpPatch("{reservationId}")]
        public async Task<ActionResult<WorkstationReservationResponse>> ModifyWorkstationReservation(int reservationId, ModifyWorkstationReservationRequest reservation)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                //return Unauthorized("User ID not found in token.");
                throw new UnauthorizedAccessToDataException("User ID not found in token.");
            }

            var userId = Guid.Parse(userIdClaim);
            var isAdmin = User.IsInRole(RoleNames.Administrator);
            var existingReservation = await _workstationReservationService.GetWorkstationReservationByIdAsync(reservationId);

            if (existingReservation == null)
            {
                //return NotFound("Reservation not found.");
                throw new NotFoundException("Reservation not found.");
            }

            if(!isAdmin && existingReservation.UserId != userId)
            {
                //return Forbid("You do not have permission to modify this reservation.");
                throw new ForbiddenAccessToData("You do not have permission to modify this reservation.");
            }


            var dbWorkstationReservation = await _workstationReservationService.ModifyWorkstationReservationAsync(reservationId, reservation);
            return Ok(dbWorkstationReservation);
        }

        [Authorize]
        [HttpDelete("{reservationId}")]
        public async Task<ActionResult> DeleteWorkstationReservation(int reservationId)
        {
            await _workstationReservationService.DeleteWorkstationReservationAsync(reservationId);
            return NoContent();
        }

        [Authorize]
        [HttpPatch("{reservationId}/confirm")]
        public async Task<ActionResult<WorkstationReservationResponse>> ConfirmWorkstationReservation(int reservationId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim);

            var dbWorkstationReservation = await _workstationReservationService.ConfirmWorkstationReservationAsync(reservationId, userId);
            return Ok(dbWorkstationReservation);
        }

    }
}
