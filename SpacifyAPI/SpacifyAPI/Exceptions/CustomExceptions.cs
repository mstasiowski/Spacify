namespace SpacifyAPI.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message)
        {
        }
    }

    public class ReservationAlreadyExistsException : Exception
    {
        public ReservationAlreadyExistsException(string message) : base(message)
        {
        }
    }

    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message)
        {
        }
    }

    public class UnauthorizedAccessToDataException : Exception
    {
        public UnauthorizedAccessToDataException(string message): base(message)
        {       
        }
    }

    public class ForbiddenAccessToData : Exception
    {
        public ForbiddenAccessToData(string message) : base(message)
        {
        }
    }

}
