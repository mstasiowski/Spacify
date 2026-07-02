using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Helpers;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        [Authorize]
        [HttpGet("/announcements")]
        public async Task<ActionResult<List<AnnouncementResponse>>> GetAllAnnouncements()
        {
            var dbAnnouncements = await _announcementService.GetAllAnnouncementsAsync();
            return Ok(dbAnnouncements);
        }

        [Authorize]
        [HttpGet("/announcements/role/{role}")]
        public async Task<ActionResult<List<AnnouncementResponse>>> GetAllAnnouncementsForSpecificRole(string role)
        {
            var dbAnnouncements = await _announcementService.GetAllAnnouncementsForSpecificRoleAsync(role);
            return Ok(dbAnnouncements);
        }

        [Authorize]
        [HttpGet("/announcements/tag/{tag}")]
        public async Task<ActionResult<List<AnnouncementResponse>>> GetAllAnnouncementsByOneTag(string tag)
        {
            var dbAnnouncements = await _announcementService.GetAllAnnouncementsByOneTagAsync(tag);
            return Ok(dbAnnouncements);
        }

        [Authorize]
        [HttpGet("/announcements/authorid/{id}")]
        public async Task<ActionResult<List<AnnouncementResponse>>> GetAllAnnouncementsByAuthorId(Guid id)
        {
            var dbAnnouncements = await _announcementService.GetAllAnnouncementsByAuthorIdAsync(id);
            return Ok(dbAnnouncements);
        }

        [Authorize]
        [HttpGet("/announcements/date/{date}")]
        public async Task<ActionResult<List<AnnouncementResponse>>> GetAllAnnouncementsForSpecificDate(DateTime date)
        {
            var dbAnnouncements = await _announcementService.GetAllAnnouncementsForSpecificDateAsync(date);
            return Ok(dbAnnouncements);
        }

        [Authorize]
        [HttpGet("/announcement/{id}")]
        public async Task<ActionResult<List<AnnouncementResponse>>> GetAnnouncementById(int id)
        {
            var dbAnnouncements = await _announcementService.GetAnnouncementByIdAsync(id);
            return Ok(dbAnnouncements);
        }

        [Authorize(Roles = $"{RoleNames.Administrator}, {RoleNames.Leader}")]
        [HttpPost]
        public async Task<ActionResult<AnnouncementResponse>> CreateAnnouncement(AnnouncementRequest announcement)
        {
            var addAnnouncement = await _announcementService.CreateAnnouncementAsync(announcement);
            return CreatedAtAction(nameof(GetAnnouncementById), new { id = addAnnouncement.Id }, addAnnouncement);
        }

        [Authorize(Roles = $"{RoleNames.Administrator}, {RoleNames.Leader}")]
        [HttpPatch("{id}")]
        public async Task<ActionResult<AnnouncementResponse>> ModifyAnnouncement(int id, [FromBody] ModifyAnnouncementRequest updateAnnouncement)
        {
            var modifiedAnnouncement = await _announcementService.ModifyAnnouncementAsync(id, updateAnnouncement);
            return Ok(modifiedAnnouncement);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpDelete("{announcementId}")]
        public async Task<ActionResult> DeleteAnnouncement(int announcementId)
        {
            await _announcementService.DeleteAnnouncementAsync(announcementId);
            return NoContent();
        }

    }
}
