
using SpacifyAPI.Interfaces;
using SpacifyAPI.Services;

namespace SpacifyAPI.Tasks
{
    public class WorkstationReservationCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<WorkstationReservationCleanupService> _logger;

        public WorkstationReservationCleanupService(IServiceScopeFactory scopeFactory, ILogger<WorkstationReservationCleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
           while(!stoppingToken.IsCancellationRequested)
            {

                using (var scope = _scopeFactory.CreateScope())
                {

                    try
                    {
                        var reservation = scope.ServiceProvider.GetRequiredService<IWorkstationReservationService>();
                        _logger.LogInformation("Cleaning up expired workstation reservations...");
                        await reservation.RemoveExpiredUnconfirmedReservationsAsync();
                        _logger.LogInformation("Expired workstation reservations cleaned up successfully.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "An error occurred while cleaning up expired workstation reservations.");
                    }

                }

                    

                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);

            }
        }
    }
}
