using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Helpers;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Controllers
{
    [Route("workstation")]
    [ApiController]
    public class WorkstationController : ControllerBase
    {
        private readonly IWorkstationService _workstationService;

        public WorkstationController(IWorkstationService service)
        {
            _workstationService = service;
        }

        [Authorize]
        [HttpGet("/workstations")]
        public async Task<ActionResult<List<WorkstationResponse>>> GetAllWorkstations()
        {
            var workstations = await _workstationService.GetAllWorkstationsAsync();
            return Ok(workstations);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkstationResponse>> GetWorkstationById(int id)
        {
            var workstation = await _workstationService.GetWorkstationByIdAsync(id);

            return Ok(workstation);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPost]
        public async Task<ActionResult<WorkstationResponse>> CreateWorkstation(CreateWorkstationRequest workstation)
        {
            var newWorkstation = await _workstationService.CreateWorkstationAsync(workstation);
            return CreatedAtAction(nameof(CreateWorkstation), new { id = newWorkstation.Id }, newWorkstation);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPut("{id}")]
        public async Task<ActionResult<WorkstationResponse>> UpdateWorkstation(int id, [FromBody] CreateWorkstationRequest updateWorkstation)
        {
            var updatedWorkstation = await _workstationService.UpdateWorkstationAsync(id, updateWorkstation);
            return Ok(updatedWorkstation);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWorkstation(int id)
        {
            await _workstationService.DeleteWorkstationAsync(id);
            return NoContent();
        }


    }
}
