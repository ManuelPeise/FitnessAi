using Data.Database.Entities.HealthConnect;
using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using System.Globalization;

namespace Logic.Ai.ModelMapper
{
    public class WorkoutIntensityCsvRowMapper : ICsvRowMapper<WorkOutIntensityCsvModel>, IWorkoutIntensityTrainingDataMapper
    {
        public WorkOutIntensityCsvModel? MapFromTrainingData(HealthConnectTrainingDataEntity entity)
        {
            var values = entity.HealthConnectTrainingDataValues;

            if (values == null || values.ElevationAvg == null || values.HeartRate == null || values.Power == null)
            {
                return null;
            }

            return new WorkOutIntensityCsvModel
            {
                DataKey = entity.DataKey,
                UserId = entity.UserId.ToString(),
                Elevation = FormatDecimal(values.ElevationAvg),
                Pace = GetPaceString(values),
                AverageHeartRate = FormatDecimal(values.HeartRate?.Avg),
                MinHeartRate = FormatDecimal(values.HeartRate?.Min),
                MaxHeartRate = FormatDecimal(values.HeartRate?.Max),
                Power = FormatDecimal(values.Power?.Avg),
                PredictedAt = null,
                Label = null,
            };
        }

        public WorkOutIntensityCsvModel MapFromRow(IReadOnlyDictionary<string, string> rowValues)
        {
            return new WorkOutIntensityCsvModel
            {
                DataKey = GetStringValueOrNull(rowValues["DataKey"]),
                UserId = GetStringValueOrNull(rowValues["userId"]),
                Elevation = GetStringValueOrNull(rowValues["Elevation"]),
                Pace = GetStringValueOrNull(rowValues["Pace"]),
                AverageHeartRate = GetStringValueOrNull(rowValues["AverageHeartRate"]),
                MinHeartRate = GetStringValueOrNull(rowValues["MinHeartRate"]),
                MaxHeartRate = GetStringValueOrNull(rowValues["MaxHeartRate"]),
                Power = GetStringValueOrNull(rowValues["Power"]),
                PredictedAt = GetStringValueOrNull(rowValues["PredictedAt"]),
                Label = GetStringValueOrNull(rowValues["Label"]),
            };
        }

        public IReadOnlyDictionary<string, string> MapToRow(WorkOutIntensityCsvModel model)
        {
            return new Dictionary<string, string>
            {
                ["DataKey"] = model.DataKey ?? string.Empty,
                ["userId"] = model.UserId ?? string.Empty,
                ["Elevation"] = model.Elevation ?? string.Empty,
                ["Pace"] = model.Pace ?? string.Empty,
                ["AverageHeartRate"] = model.AverageHeartRate ?? string.Empty,
                ["MinHeartRate"] = model.MinHeartRate ?? string.Empty,
                ["MaxHeartRate"] = model.MaxHeartRate ?? string.Empty,
                ["Power"] = model.Power ?? string.Empty,
                ["PredictedAt"] = model.PredictedAt ?? string.Empty,
                ["Label"] = model.Label ?? string.Empty,
            };
        }

        // Invariant culture (never a locale-dependent decimal comma, which would read like an
        // extra CSV column) and "0.##" trims trailing zeros a DB-stored scale would otherwise
        // carry (e.g. 57.00 -> "57" instead of "57,00"/"57.00").
        private static string? FormatDecimal(decimal? value)
        {
            return value?.ToString("0.##", CultureInfo.InvariantCulture);
        }

        // Seconds-per-km, formatted as MM:SS - matches the formula the (now-removed)
        // WorkoutIntensityModelTrainer used for the same calculation.
        private static string? GetPaceString(HealthConnectTrainingDataValuesEntity values)
        {
            if (!values.DistanceInMeters.HasValue || !values.DurationSeconds.HasValue ||
                values.DistanceInMeters.Value <= 0 || values.DurationSeconds.Value <= 0)
            {
                return null;
            }

            var secondsPerKm = values.DurationSeconds.Value / values.DistanceInMeters.Value * 1000;
            var paceTimeSpan = TimeSpan.FromSeconds((double)secondsPerKm);

            return $"{(int)paceTimeSpan.TotalMinutes:D2}:{paceTimeSpan.Seconds:D2}";
        }

        private static string? GetStringValueOrNull(string? value)
        {
            return string.IsNullOrEmpty(value) ? null : value;
        }
    }
}
