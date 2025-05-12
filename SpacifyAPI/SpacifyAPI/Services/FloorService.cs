using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Services
{
    public class FloorService : IFloorService
    {
        private readonly SpacifyDbContext _context;

        public FloorService(SpacifyDbContext context)
        {
            _context = context;
        }

        public async Task<List<FloorResponse>> GetAllFloorsAsync()
        {
            var floors = await _context.Floors
                .ToListAsync();

            if (floors == null || floors.Count == 0)
            {
                throw new NotFoundException("No floors found in the database.");
            }

                return new List<FloorResponse>(floors.Select(f => new FloorResponse
                {
                    Id = f.Id,
                    Name = f.Name,
                    ImageUrl = f.ImageUrl,
                }));
        }

        public async Task<FloorResponse> GetFloorByIdAsync(int id)
        {
            var floor = await _context.Floors
                .Include(f => f.ConferenceRooms)
                .Include(f => f.Workstations)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (floor == null)
            {
                throw new NotFoundException($"Floor with id {id} not found."); 
            }

            return new FloorResponse
            {
                Id = floor.Id,
                Name = floor.Name,
                ImageUrl = floor.ImageUrl,
                ConferenceRooms = (floor.ConferenceRooms == null || !floor.ConferenceRooms.Any())? null: floor.ConferenceRooms.Select(cr => new ConferenceRoomResponse
                {
                    Id = cr.Id,
                    Name = cr.Name,
                    EquipmentDetails = cr.EquipmentDetails,
                    ImageUrl = cr.ImageUrl,
                    Capacity = cr.Capacity,
                    FloorId = cr.FloorId
                }).ToList(),
                Workstations = (floor.Workstations == null || !floor.Workstations.Any()) ? null : floor.Workstations.Select(w => new WorkstationResponse
                {
                    Id = w.Id,
                    DeskNumber = w.DeskNumber,
                    PositionX = w.PositionX,
                    PositionY = w.PositionY,
                    FloorId = w.FloorId
                }).ToList()

            };
        }

        public async Task<FloorResponse> CreateFloorAsync(CreateFloorRequest floor)
        {
            if(floor == null)
            {
                throw new BadRequestException("Floor cannot be null.");
            }

            if(string.IsNullOrWhiteSpace(floor.Name) || string.IsNullOrWhiteSpace(floor.ImageUrl))
            {
                throw new BadRequestException("Floor name and image URL cannot be empty.");
            }

            var newFloor = new Floor
            {
                Name = floor.Name,
                ImageUrl = floor.ImageUrl
            };

            _context.Floors.Add(newFloor);
            await  _context.SaveChangesAsync();

           

            return new FloorResponse
            {
                Id = newFloor.Id,
                Name = newFloor.Name,
                ImageUrl = newFloor.ImageUrl
            };

        }

        public async Task<FloorResponse> UpdateFloorAsync(int id, CreateFloorRequest updateFloor)
        {
            var dbFloor = await _context.Floors.FindAsync(id);

            if (dbFloor == null)
            {
                throw new NotFoundException($"Floor with id {id} not found.");
            }

            if(updateFloor == null)
            {
                throw new BadRequestException("Floor cannot be null.");
            }

            if(!string.IsNullOrWhiteSpace(updateFloor.Name))
            {
                dbFloor.Name = updateFloor.Name;
            }else
            {
                throw new BadRequestException("Floor name cannot be empty.");
            }

            if (!string.IsNullOrWhiteSpace(updateFloor.ImageUrl))
            {
                dbFloor.ImageUrl = updateFloor.ImageUrl;
            }else
            {
                throw new BadRequestException("Floor image URL cannot be empty.");
            }

            await _context.SaveChangesAsync();
            return new FloorResponse
            {
                Id = dbFloor.Id,
                Name = dbFloor.Name,
                ImageUrl = dbFloor.ImageUrl
            };


        }

        public async Task DeleteFloorAsync(int id)
        {
            var dbFloor = await _context.Floors.FindAsync(id);

            if (dbFloor == null)
            {
                throw new NotFoundException($"Floor with id {id} not found.");
            }

            _context.Floors.Remove(dbFloor);
            await _context.SaveChangesAsync();

        }
  
    }
}
