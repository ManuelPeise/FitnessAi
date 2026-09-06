using Core.Api.AuthorizationAttributes;
using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.Enums.Authentication;

namespace Core.Api.ApiControllers.Scheduler
{

    public class ScheduledTaskController: ApiControllerBase
    {
        private readonly IScheduledTaskService _scheduledTaskService;

        public ScheduledTaskController(IScheduledTaskService scheduledTaskService)
        {
            _scheduledTaskService = scheduledTaskService;
        }

        [MaintenanceApiAuthentication(UserRoleEnum.MaintenanceRole)]
        [HttpPost(Name = "ProcessScheduledTasks")]
        public async Task ProcessScheduledTasks(CancellationToken cancellationToken = default)
        {
            await _scheduledTaskService.Execute(cancellationToken);
        }
    }
}
