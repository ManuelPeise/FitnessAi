namespace Shared.Enums.Authentication
{
    [Flags]
    public enum UserRoleEnum
    {
        None = 0,
        UserRole = 1,
        AdminRole = 2,
        MaintenanceRole = 4
    }
}
