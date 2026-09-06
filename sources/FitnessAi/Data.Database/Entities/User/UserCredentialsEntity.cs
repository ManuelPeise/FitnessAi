namespace Data.Database.Entities.User
{
    public class UserCredentialsEntity:AEntityBase
    {
        public string PasswordHash { get; set; } = null!;
        public string? RefreshToken { get; set; }
    }
}
