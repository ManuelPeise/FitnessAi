namespace Shared.Models.Authentication
{
    public sealed class DefaultAdminUserOptions
    {
        public const string SectionName = "DefaultAdminUser";
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
