namespace Data.Database.Models.Scheduler
{
    public class WebServiceModel
    {
        public Uri Url { get; set; } = null!;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public string? RequestBody { get; set; }
    }
}
