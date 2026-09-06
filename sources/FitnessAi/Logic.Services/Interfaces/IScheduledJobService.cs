using Data.Database.Entities.Scheduler;
using Data.Database.Models.Scheduler;
using Shared.Enums.Scheduler;

namespace Logic.Services.Interfaces
{
    public interface IScheduledJobService
    {
        Task<IReadOnlyList<ScheduledJobEntity>> GetAllJobsByStatusAsync(ScheduledJobStatus status);
        Task AddJobAsync(string name, string description, WebServiceModel model);
        Task Update(long id, ScheduledJobStatus status, string? errorMessage = null);
        Task Delete(long id);
    }
}
