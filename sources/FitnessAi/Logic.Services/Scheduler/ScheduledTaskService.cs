using Data.Database.Entities.Scheduler;
using Logic.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Enums.Scheduler;
using Shared.Interfaces.Http;
using System.Text;

namespace Logic.Services.Scheduler
{
    public class ScheduledTaskService: IScheduledTaskService
    {
        private readonly ILogger<ScheduledTaskService> _logger;
        private readonly IScheduledJobService _scheduledJobService;
        private readonly IInternalHttpClient _internalHttpClient;

        public ScheduledTaskService(
            ILogger<ScheduledTaskService> logger,
            IScheduledJobService scheduledJobService,
            IInternalHttpClient internalHttpClient)
        {
            _logger = logger;
            _scheduledJobService = scheduledJobService;
            _internalHttpClient = internalHttpClient;
        }

        public async Task Execute(CancellationToken cancellationToken = default)
        {
            ScheduledJobEntity? currentJob = null;


            var scheduledJobs = await _scheduledJobService.GetAllJobsByStatusAsync(ScheduledJobStatus.Pending);

            if (!scheduledJobs.Any())
            {
                _logger.LogInformation("No pending scheduled jobs found.");
                return;
            }

            foreach (var job in scheduledJobs)
            {
                try
                {
                    currentJob = job;

                    _logger.LogInformation($"Executing scheduled job: {job.Id} - {job.Name}");

                    await _scheduledJobService.Update(job.Id, ScheduledJobStatus.InProgress);

                    var jobModel = job.RequestModelJsonToModel();

                    if(jobModel == null)
                    {
                        throw new InvalidOperationException($"Request model for job {job.Id} is null.");
                    }
  
                    var httpContent = new StringContent(jobModel.RequestBody ?? string.Empty, Encoding.UTF8, "application/json");

                    var response = await _internalHttpClient.PostAsync(jobModel.Url.ToString(), jobModel.Parameters, httpContent, cancellationToken);

                    response.EnsureSuccessStatusCode();

                    await _scheduledJobService.Update(job.Id, ScheduledJobStatus.Completed);

                    _logger.LogInformation($"Scheduled job executed successfully: {job.Id} - {job.Name}");
                }
                catch (Exception jobException)
                {
                    _logger.LogError(jobException, $"An error occurred while executing scheduled job: {job.Id} - {job.Name}");

                    if (currentJob != null)
                    {
                        await _scheduledJobService.Update(currentJob.Id, ScheduledJobStatus.Failed, jobException.Message);
                    }
                }
            }
        }
    }
}
