using Quartz;

namespace Core.Api.Bundels.Scheduler
{
    public static class SchedulerServiceRegistration
    {
        public static void AddSchedulerServices(this IServiceCollection services)
        {
            var utcNow = DateTime.Now;

            services.AddQuartz(q =>
            {
                q.ConfigureWebJob(
                    url: "ScheduledTask/ProcessScheduledTasks",
                    triggerName: "ScheduledTaskTrigger",
                    cronExpression: "0 0/1 * * * ?",  // "0 0/15 * * * ?"
                    now: utcNow,
                    minuteOffset: 2);
            });

            services.AddQuartzHostedService(options =>
            {
                options.WaitForJobsToComplete = true;
            });
        }

        private static void ConfigureWebJob(
            this IQuartzBuilder builder,
            string url,
            string triggerName,
            string cronExpression,
            DateTime now,
            int minuteOffset = 0)
        {
            var dateBuilder = DateBuilder.Create()
                    .AtHourMinuteAndSecond(now.Hour, GetMinuteOffset(now.Minute, minuteOffset), 0)
                    .Build();

            builder.ScheduleJob<WebJob>(trigger => trigger
                .WithIdentity(triggerName)
                .WithDescription($"Trigger for {triggerName}")
                .UsingJobData(job => job.Url, url)
                .UsingJobData(job => job.Parameters, new Dictionary<string, object>())
#if DEBUG
                .StartNow()
#else
                .StartAt(dateBuilder)
#endif
                .WithCronSchedule(cronExpression));
        }

        private static int GetMinuteOffset(int minute, int minuteOffset)
        {
            var calculatedMinute = minute + minuteOffset;
            
            if (calculatedMinute > 59)
            {
                calculatedMinute -= 60;
            }

            return calculatedMinute;
        }
    }
}
