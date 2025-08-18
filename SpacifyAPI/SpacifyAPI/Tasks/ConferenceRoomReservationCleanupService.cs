
using SpacifyAPI.Interfaces;

namespace SpacifyAPI.Tasks
{
    public class ConferenceRoomReservationCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ConferenceRoomReservationCleanupService> _logger;

        public ConferenceRoomReservationCleanupService(
            IServiceScopeFactory scopeFactory,
            ILogger<ConferenceRoomReservationCleanupService> logger)
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
                        var reservationService = scope.ServiceProvider.GetRequiredService<IConferenceRoomReservationService>();
                        _logger.LogInformation($"[{DateTime.Now}] Cleaning up expired unconfirmed conference room reservations...");
                        await reservationService.RemoveExpiredUnconfirmedConferenceRoomReservationsAsync();
                        _logger.LogInformation("Expired unconfirmed conference room reservations cleaned up successfully.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "An error occurred while cleaning up expired unconfirmed conference room reservations.");
                    }
                }
                await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
            }
        }
    }
}
