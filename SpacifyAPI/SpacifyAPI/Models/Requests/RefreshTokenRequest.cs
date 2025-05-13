namespace SpacifyAPI.Models.Requests
{
    public class RefreshTokenRequest
    {
        public Guid UserId { get; set; }
        public required string RefreshToken { get; set; }
        //Ten request pewnie do wyrzucenia
    }
}
