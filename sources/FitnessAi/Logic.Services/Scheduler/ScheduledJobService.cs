using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Scheduler;
using Data.Database.Models.Scheduler;
using Logic.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Enums.Scheduler;

namespace Logic.Services.Scheduler
{
    public class ScheduledJobService : IScheduledJobService
    {
        private readonly ILogger<ScheduledJobService> _logger;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;

        public ScheduledJobService(
            IApplicationUnitOfWork applicationUnitOfWork,
            ILogger<ScheduledJobService> logger)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
            _logger = logger;
        }

        public async Task<IReadOnlyList<ScheduledJobEntity>> GetAllJobsByStatusAsync(ScheduledJobStatus status)
        {
            try
            {
                return await _applicationUnitOfWork.ScheduledJobsRepository.GetAsync(
                    new DbQueryOptions<ScheduledJobEntity>
                    {
                        WhereExpression = job => job.Status == status,
                        OrderByExpression = job => job.PublishedAt,
                        OrderByDescending = true,
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all scheduled jobs.");
                throw;
            }
        }

        public async Task AddJobAsync(string name, string description, WebServiceModel model)
        {
            try
            {
                var newScheduledJobEntity = new ScheduledJobEntity
                {
                    Name = name,
                    Description = description,
                    Status = ScheduledJobStatus.Pending,
                };

                newScheduledJobEntity.ModelToRequestModel(model);

                await _applicationUnitOfWork.ScheduledJobsRepository.AddAsync(newScheduledJobEntity);
                await _applicationUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while adding a scheduled job.");
                throw;
            }
        }

        public async Task Update(long id, ScheduledJobStatus status, string? errorMessage = null)
        {
            try
            {
                var scheduledJobEntity = await _applicationUnitOfWork.ScheduledJobsRepository.GetByIdAsync(id);

                if (scheduledJobEntity == null)
                {
                    throw new InvalidOperationException($"Scheduled job with ID {id} not found.");
                }

                SetStatus(scheduledJobEntity, status, errorMessage);

                await _applicationUnitOfWork.SaveChangesAsync();
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while updating a scheduled job.");
                throw;
            }
        }

        public async Task Delete(long id)
        {
            try
            {
                var scheduledJobEntity = await _applicationUnitOfWork.ScheduledJobsRepository.GetByIdAsync(id);

                if (scheduledJobEntity == null)
                {
                    throw new InvalidOperationException($"Scheduled job with ID {id} not found.");
                }

                await _applicationUnitOfWork.ScheduledJobsRepository.DeleteAsync(scheduledJobEntity);

                await _applicationUnitOfWork.SaveChangesAsync();
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An error occurred while deleting a scheduled job.");
                throw;
            }
        }

        private void SetStatus(ScheduledJobEntity entity, ScheduledJobStatus status, string? errorMessage = null)
        {
            entity.Status = status;

            switch (status)
            {
                case ScheduledJobStatus.Pending:
                    entity.PublishedAt = DateTime.Now;
                    entity.StartedAt = null;
                    entity.CompletedAt = null;
                    entity.FailedAt = null;
                    entity.ErrorMessage = null;
                    break;
                case ScheduledJobStatus.InProgress:
                    entity.StartedAt = DateTime.UtcNow;
                    entity.CompletedAt = null;
                    entity.FailedAt = null;
                    entity.ErrorMessage = null;
                    break;
                case ScheduledJobStatus.Completed:
                    entity.CompletedAt = DateTime.UtcNow;
                    entity.FailedAt = null;
                    break;
                case ScheduledJobStatus.Failed:
                    entity.FailedAt = DateTime.UtcNow;
                    entity.CompletedAt = null;
                    entity.ErrorMessage = errorMessage;
                    break;
            }
        }
    }
}
