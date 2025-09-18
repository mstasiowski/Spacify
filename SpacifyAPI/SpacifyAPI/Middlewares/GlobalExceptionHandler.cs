using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Exceptions;

namespace SpacifyAPI.Middlewares
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "| An exception occurred. |");

            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                NotFoundException => (StatusCodes.Status404NotFound, exception.Message),
                BadRequestException => (StatusCodes.Status400BadRequest, exception.Message),
                ReservationAlreadyExistsException => (StatusCodes.Status409Conflict, exception.Message),
                UnauthorizedAccessToDataException => (StatusCodes.Status401Unauthorized, exception.Message),
                ForbiddenAccessToData =>(StatusCodes.Status403Forbidden, exception.Message),
                BadHttpRequestException badHttpRequestEx when badHttpRequestEx.Message.Contains("Request body too large") =>
                (StatusCodes.Status413PayloadTooLarge, "Request body too large (max 1 MB)."),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
            };

            context.Response.StatusCode = statusCode;

            var problem = new ProblemDetails
            {
                Status = statusCode,
                Title = message,
                Type = "https://httpstatuses.com/" + statusCode
            };

            await context.Response.WriteAsJsonAsync(problem);
            return true;
        }
    }
}
