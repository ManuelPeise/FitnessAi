namespace Logic.Services.Interfaces
{
    public interface IScheduledTaskService
    {
        Task Execute(CancellationToken cancellationToken = default);
    }
}
