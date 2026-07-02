using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Enums;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using System.Data;

namespace SpacifyAPI.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly SpacifyDbContext _context;

        public AnnouncementService(SpacifyDbContext context)
        {
            _context = context;
        }

        public async Task<List<AnnouncementResponse>> GetAllAnnouncementsAsync()
        {
            var dbAnnouncement = await _context.Announcements
                .AsNoTracking()
                .Include(a => a.Author)
                .Include(a => a.AnnouncementTags)
                .ThenInclude(at => at.Tag)
                .ToListAsync();

            if(!dbAnnouncement.Any())
            {
                return new List<AnnouncementResponse>();
            }

            return dbAnnouncement.Select(a => MapToResponse(a)).ToList();

        }

        public async Task<List<AnnouncementResponse>> GetAllAnnouncementsForSpecificRoleAsync(string role)
        {
            if (string.IsNullOrWhiteSpace(role))
            {
                throw new BadRequestException("Role cannot be null or empty.");
            }

            string searchedRole= ","+ role.Trim().ToLower()+ ',';

            var dbAnnouncement = await _context.Announcements
                .AsNoTracking()
                .Include(a => a.Author)
                .Include(at => at.AnnouncementTags)
                .ThenInclude(at => at.Tag)
                .Where(a=> (','+ a.AllowedRoles.Replace(" ","").ToLower() + ',' ).Contains(searchedRole))
                .ToListAsync();

            if (!dbAnnouncement.Any())
             {
              return new List<AnnouncementResponse>();
             }


            return dbAnnouncement.Select(a => MapToResponse(a)).ToList();
        }

        public async Task<List<AnnouncementResponse>> GetAllAnnouncementsByOneTagAsync(string tag)
        {
            if (string.IsNullOrWhiteSpace(tag))
            {
                throw new BadRequestException("Tag cannot be null or empty.");
            }


            string normalizedTag = tag.Trim().ToLower();

            var dbAnnouncement = await _context.Announcements
                .AsNoTracking()
                .Include(a => a.Author)
                .Include(at => at.AnnouncementTags)
                .ThenInclude(at => at.Tag)
                .Where(a => a.AnnouncementTags.Any(t=> t.Tag.Name.ToLower() == normalizedTag))
                .ToListAsync();

            if (!dbAnnouncement.Any())
            {
                return new List<AnnouncementResponse>();
            }


            return dbAnnouncement.Select(a => MapToResponse(a)).ToList();
        }

        public async Task<List<AnnouncementResponse>> GetAllAnnouncementsByAuthorIdAsync(Guid authorId)
        {
            if (authorId == Guid.Empty)
            {
                throw new BadRequestException("AuthorId cannot be empty.");
            }

            var dbAnnouncement = await _context.Announcements
                .AsNoTracking()
                .Include(a => a.Author)
                .Include(at => at.AnnouncementTags)
                .ThenInclude(at => at.Tag)
                .Where(a=> a.AuthorId == authorId)
                .ToListAsync();

            if (!dbAnnouncement.Any()) {
                return new List<AnnouncementResponse>();
            }

            return dbAnnouncement.Select(a => MapToResponse(a)).ToList();
        }

        public async Task<List<AnnouncementResponse>> GetAllAnnouncementsForSpecificDateAsync(DateTime date)
        {
            if(date == DateTime.MinValue || date.Date.Year > DateTime.Now.Year)
            {
                throw new BadRequestException("Invalid date provided.");
            }

            DateTime startDate = date.Date;
            DateTime endDate = startDate.AddDays(1);

            var dbAnnouncement = await _context.Announcements
                .AsNoTracking()
                .Include(a => a.Author)
                .Include(at => at.AnnouncementTags)
                .ThenInclude(at => at.Tag)
                .Where(a=> a.CreatedDate >= startDate && a.CreatedDate < endDate)
                .ToListAsync();

            return dbAnnouncement.Select(a => MapToResponse(a)).ToList();

        }

        public async Task<AnnouncementResponse> GetAnnouncementByIdAsync(int id)
        {
            if(id < 1)
            {
                throw new BadRequestException("Id must be greater than 0.");
            }

            var dbannouncement = await _context.Announcements
                 .AsNoTracking()
                 .Include(a => a.Author)
                 .Include(at => at.AnnouncementTags)
                 .ThenInclude(at => at.Tag)
                 .FirstOrDefaultAsync(a => a.Id == id);

            if (dbannouncement == null)
            {
                throw new NotFoundException($"Announcement with id {id} not found.");
            }

            return MapToResponse(dbannouncement);

        }

        public async Task<AnnouncementResponse> CreateAnnouncementAsync(AnnouncementRequest announcement)
        {
           
            await ValidateTitleAsync(announcement.Title);
            ValidateDescription(announcement.Description);
            ValidateExpirationDate(announcement.ExpirationDate);
            ValidateAllowedRoles(announcement.AllowedRoles);
            await ValidateAuthorAsync(announcement.AuthorId);


            var newAnnouncement = new Announcement
            {
                Title = announcement.Title,
                Description = announcement.Description,
                CreatedDate = DateTime.Now,
                ExpirationDate = announcement.ExpirationDate,
                AllowedRoles = NormalizeAllowedRoles(announcement.AllowedRoles),
                AuthorId = announcement.AuthorId
            };

            if (announcement.Tags != null && announcement.Tags.Any())
            {
                await ValidateTagsAsync(announcement.Tags);


                foreach (var tagRequest in announcement.Tags)
                {
                    var announcementTag = new AnnouncementTag
                    {
                        TagId = tagRequest.TagId,
                        AssignedAt = DateTime.Now,
                        DisplayOrder = tagRequest.DisplayOrder
                    };
                    
                    newAnnouncement.AnnouncementTags.Add(announcementTag);
                }

            }

            _context.Announcements.Add(newAnnouncement);
            await _context.SaveChangesAsync();

            var createdAnnouncement = await _context.Announcements
            .Include(a => a.Author)
            .Include(at => at.AnnouncementTags)
            .ThenInclude(at => at.Tag)
            .FirstOrDefaultAsync(a => a.Id == newAnnouncement.Id);

            if (createdAnnouncement != null)
            {
                return MapToResponse(createdAnnouncement);

            }
            else { 
                throw new Exception("An error occurred while creating the announcement.");
            }


        }

        public async Task<AnnouncementResponse> ModifyAnnouncementAsync(int id, ModifyAnnouncementRequest updateAnnouncement)
        {
            if (id < 1)
                throw new BadRequestException("Id must be greater than 0.");

            if (updateAnnouncement == null)
                throw new BadRequestException("Announcement data cannot be null.");
            

            var existingAnnouncement = await _context.Announcements
                .Include(a => a.Author)
                .Include(a => a.AnnouncementTags)
                .ThenInclude(at => at.Tag)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existingAnnouncement == null)
                throw new NotFoundException($"Announcement with id {id} not found.");

            if(updateAnnouncement.Title != null)
            {
                await ValidateTitleAsync(updateAnnouncement.Title, id);

                existingAnnouncement.Title = updateAnnouncement.Title.Trim();
            }

            if(updateAnnouncement.Description != null)
            {
                
                ValidateDescription(updateAnnouncement.Description);

                existingAnnouncement.Description = updateAnnouncement.Description.Trim();
            }

            if(updateAnnouncement.ExpirationDate.HasValue)
            {
                
                ValidateExpirationDate(updateAnnouncement.ExpirationDate);

                existingAnnouncement.ExpirationDate = updateAnnouncement.ExpirationDate.Value;
            }

            if (updateAnnouncement.AllowedRoles != null)
            { 
               
                ValidateAllowedRoles(updateAnnouncement.AllowedRoles);

                existingAnnouncement.AllowedRoles = NormalizeAllowedRoles(updateAnnouncement.AllowedRoles);
            }

            if(updateAnnouncement.Tags != null)
            {
                
                await ValidateTagsAsync(updateAnnouncement.Tags);

                _context.RemoveRange(existingAnnouncement.AnnouncementTags);

                existingAnnouncement.AnnouncementTags = updateAnnouncement.Tags.Select(t => new AnnouncementTag
                {
                    TagId = t.TagId,
                    AssignedAt = DateTime.Now,
                    DisplayOrder = t.DisplayOrder
                }).ToList();
            }

            existingAnnouncement.ModifiedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            await _context.Entry(existingAnnouncement).Reference(a => a.Author).LoadAsync();
            await _context.Entry(existingAnnouncement).Collection(a => a.AnnouncementTags).Query().Include(at => at.Tag).LoadAsync();

            return MapToResponse(existingAnnouncement);
        }

        public async Task DeleteAnnouncementAsync(int id)
        {
            if(id < 1)
                throw new BadRequestException("Id must be greater than 0.");

            var dbAnnouncement = await _context.Announcements.FirstOrDefaultAsync(a => a.Id == id);
            if (dbAnnouncement == null)
            {
                throw new NotFoundException($"Announcement with id {id} not found.");
            }

            _context.Announcements.Remove(dbAnnouncement);
            await _context.SaveChangesAsync();

        }

        private AnnouncementResponse MapToResponse(Announcement announcement)
        {
            return new AnnouncementResponse
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Description = announcement.Description,
                CreatedDate = announcement.CreatedDate,
                ModifiedAt = announcement.ModifiedAt,
                ExpirationDate = announcement.ExpirationDate,
                AllowedRoles = announcement.AllowedRoles,
                AuthorId = announcement.AuthorId,
                Author = announcement.Author != null ? new UserResponse 
                { 
                    Id= announcement.Author.Id,
                    Name = announcement.Author.Name,
                    Surname = announcement.Author.Surname,
                    Email = announcement.Author.Email,
                    Username =announcement.Author.Username,
                    Role = announcement.Author.Role.ToString()
                }:null,
                Tags = announcement.AnnouncementTags?.Select(at => new AnnouncementTagResponse
                {
                    TagId = at.TagId,
                    Name = at.Tag?.Name ?? "Nieznany tag",
                    Color = at.Tag?.Color ?? "#FF5533",
                    AssignedAt = at.AssignedAt,
                    DisplayOrder = at.DisplayOrder
                }).ToList() ?? new List<AnnouncementTagResponse>()
            };
        }

        private async Task ValidateTitleAsync(string title, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new BadRequestException("Title cannot be null or empty.");
            
            if(title.Trim().Length < 10)
                throw new BadRequestException("Title must be at least 10 characters long.");

            bool titleExists = await _context.Announcements.AnyAsync(a => a.Title.ToLower() == title.ToLower() && a.Id != excludeId);

            if (titleExists)
                throw new BadRequestException($"Announcement with title '{title}' already exists.");

        }

        private void ValidateDescription(string description)
        {
            if(string.IsNullOrWhiteSpace(description))
                throw new BadRequestException("Description cannot be null or empty.");

            if(description.Trim().Length < 20 || description.Trim().Length > 500)
                throw new BadRequestException("Description must be between 20 and 500 characters long.");
        }

        private void ValidateExpirationDate(DateTime? expirationDate)
        {
            if(expirationDate.HasValue && expirationDate.Value < DateTime.Now)
                throw new BadRequestException("ExpirationDate cannot be in the past.");
        }

        private void ValidateAllowedRoles(string allowedRoles)
        {
            if(string.IsNullOrWhiteSpace(allowedRoles))
                throw new BadRequestException("AllowedRoles cannot be null or empty.");

            var validRoles = Enum.GetNames(typeof(UserRole));

            var providedRoles = allowedRoles.Split(',')
                .Select(r => r.Trim())
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .ToList();

            if(!providedRoles.Any())
                throw new BadRequestException("At least one valid role must be provided in AllowedRoles.");

            var invalidRoles = providedRoles
            .Where(r => !validRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
            .ToList();

            if(invalidRoles.Any())
                throw new BadRequestException($"Invalid roles in AllowedRoles: {string.Join(", ", invalidRoles)}. Valid roles are: {string.Join(", ", validRoles)}.");
        }

        private string NormalizeAllowedRoles(string allowedRoles)
        {
            var validRoles = Enum.GetNames(typeof(UserRole));
            return string.Join(", ", allowedRoles
                .Split(',')
                .Select(r => r.Trim())
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => validRoles.First(vr => vr.Equals(r, StringComparison.OrdinalIgnoreCase))));
        }

        private async Task ValidateAuthorAsync(Guid authorId)
        {
            if(authorId == Guid.Empty)
                throw new BadRequestException("AuthorId cannot be empty.");

            bool authorExists = await _context.Users.AnyAsync(u => u.Id == authorId);

            if(!authorExists)
                throw new NotFoundException($"Author with id {authorId} does not exist.");

        }

        private async Task ValidateTagsAsync(List<AnnouncementTagRequest> tags)
        {
            if(tags == null || !tags.Any())
                return;

            var tagIds = tags.Select(t => t.TagId).ToList();

            bool allTagsExist = await _context.Tags
                .Where(t => tagIds.Contains(t.Id))
                .CountAsync() == tagIds.Count;

            if(!allTagsExist)
                throw new BadRequestException("One or more provided tags do not exist.");
        }

    }
}
