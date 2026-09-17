using Shared.Enums.HealthConnect;

namespace Shared.Models.HealthConnect.QueryModels
{
    public class TrainingDataQuery
    {
        public ExerciseTypeEnum? ExerciseType { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 25;
    }
}
