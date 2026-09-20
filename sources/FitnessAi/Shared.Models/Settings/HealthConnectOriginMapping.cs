namespace Shared.Models.Settings
{
    public class HealthConnectOriginMapping
    {
        public bool IsActive { get; set; }
        public string Source { get; set; } = null!;
        public string? Target { get; set; }
    }
}
