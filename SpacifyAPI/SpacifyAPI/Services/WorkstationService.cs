using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Services
{
    public class WorkstationService : IWorkstationService
    {
        private readonly SpacifyDbContext _context;
        public WorkstationService(SpacifyDbContext context)
        {
            _context = context;
        }
        public async Task<List<WorkstationResponse>> GetAllWorkstationsAsync()
        {
            var dbWorkstations = await _context.Workstations.ToListAsync();

            if (dbWorkstations == null || dbWorkstations.Count == 0)
            {
                throw new NotFoundException("No workstations found in the database.");
            }

            return new List<WorkstationResponse>(dbWorkstations.Select(w => new WorkstationResponse
            {
                Id = w.Id,
                DeskNumber = w.DeskNumber,
                PositionX = w.PositionX,
                PositionY = w.PositionY,
                FloorId = w.FloorId
            }

            ));

        }
        public async Task<WorkstationResponse> GetWorkstationByIdAsync(int id)
        {
            var dbWorkstation = await _context.Workstations.FirstOrDefaultAsync(w => w.Id == id);

            if (dbWorkstation == null)
            {
                throw new NotFoundException($"Workstation with id {id} not found.");
            }

            return new WorkstationResponse
            {
                Id = dbWorkstation.Id,
                DeskNumber = dbWorkstation.DeskNumber,
                PositionX = dbWorkstation.PositionX,
                PositionY = dbWorkstation.PositionY,
                FloorId = dbWorkstation.FloorId
                //Todo : add WorkstationReservations
            };

        }
        public async Task<WorkstationResponse> CreateWorkstationAsync(CreateWorkstationRequest workstation)
        {
            if (workstation == null)
            {
               throw new BadRequestException("Workstation data is null.");
            }

            if(workstation.DeskNumber <= 0)
            {
                throw new BadRequestException("Desk number must be greater than zero.");
            }

            if (workstation.PositionX < 0 || workstation.PositionY < 0)
            {
                throw new BadRequestException("Position coordinates must be non-negative.");
            }

            if (workstation.FloorId <= 0)
            {
                throw new BadRequestException("Floor ID must be greater than zero.");
            }

            var existingFloor = await _context.Floors.FindAsync(workstation.FloorId);

            if (existingFloor == null)
            {
                throw new NotFoundException($"Floor with id {workstation.FloorId} not found.");
            }

            var newWorkstation = new Workstation
            {
                DeskNumber = workstation.DeskNumber,
                PositionX = workstation.PositionX,
                PositionY = workstation.PositionY,
                FloorId = workstation.FloorId
            };

            _context.Workstations.Add(newWorkstation);
            await _context.SaveChangesAsync();

            return new WorkstationResponse
            {
                Id = newWorkstation.Id,
                DeskNumber = newWorkstation.DeskNumber,
                PositionX = newWorkstation.PositionX,
                PositionY = newWorkstation.PositionY,
                FloorId = newWorkstation.FloorId
            };


        }
        public async Task<WorkstationResponse> UpdateWorkstationAsync(int id, CreateWorkstationRequest updatedWorkstation)
        {
            var dbWorkstation = await _context.Workstations.FindAsync(id);

            if (dbWorkstation == null)
            {
                throw new NotFoundException($"Workstation with id {id} not found.");
            }

            if (updatedWorkstation == null)
            {
                throw new BadRequestException("Updated workstation data is null.");
            }


            if(updatedWorkstation.DeskNumber > 0)
            {
                dbWorkstation.DeskNumber = updatedWorkstation.DeskNumber;
            }else
            {
                throw new BadRequestException("Desk number must be greater than zero.");
            }


            if (updatedWorkstation.PositionX >= 0 && updatedWorkstation.PositionY >= 0)
            {
                dbWorkstation.PositionX = updatedWorkstation.PositionX;
                dbWorkstation.PositionY = updatedWorkstation.PositionY;
            }
            else
            {
                throw new BadRequestException("Position coordinates must be non-negative.");
            }

            if (updatedWorkstation.FloorId > 0)
            {
                dbWorkstation.FloorId = updatedWorkstation.FloorId;
            }
            else
            {
                throw new BadRequestException("Floor ID must be greater than zero.");
            }

            var existingFloor = await _context.Floors.FindAsync(updatedWorkstation.FloorId);

            if (existingFloor == null)
            {
                throw new NotFoundException($"Floor with id {updatedWorkstation.FloorId} not found.");
            }

            await _context.SaveChangesAsync();

            return new WorkstationResponse
            {
                Id = dbWorkstation.Id,
                DeskNumber = dbWorkstation.DeskNumber,
                PositionX = dbWorkstation.PositionX,
                PositionY = dbWorkstation.PositionY,
                FloorId = dbWorkstation.FloorId
            };
        }
        public async Task DeleteWorkstationAsync(int id)
        {
            var dbWorkstation = await _context.Workstations.FindAsync(id);

            if (dbWorkstation == null)
            {
                throw new NotFoundException($"Workstation with id {id} not found.");
            }

            _context.Workstations.Remove(dbWorkstation);
            await _context.SaveChangesAsync();

        }
    }
    
}
