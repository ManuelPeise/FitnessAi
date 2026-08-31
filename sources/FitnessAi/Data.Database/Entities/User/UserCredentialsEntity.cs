namespace Data.Database.Entities.User
{
    public class UserCredentialsEntity:AEntityBase
    {
        public string Salt { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? RefreshToken { get; set; }
    }
}
