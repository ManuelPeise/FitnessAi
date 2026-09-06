using Quartz;

namespace Core.Api.Bundels.Scheduler
{
    public static class SchedulerServiceRegistration
    {
        public static void AddSchedulerServices(this IServiceCollection services)
        {
            services.AddQuartz(q =>
            {
                q.ConfigureWebJob(
                    url: "loadData",
                    triggerName: "WebJobTrigger",
                    cronExpression: "0/60 * * * * ?");
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
            string cronExpression)
        {
            builder.ScheduleJob<WebJob>(trigger => trigger
                .WithIdentity(triggerName)
                .WithDescription($"Trigger for {triggerName}")
                .UsingJobData(job => job.Url, new Uri(url, UriKind.Relative))
                .WithCronSchedule(cronExpression));
        }
    }
}
