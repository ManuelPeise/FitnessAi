using Data.Database.Entities.User;

namespace Logic.Services.DataImport
{
    internal class HealthDataImportHelper
    {
        private readonly UserBodyDataEntity? _userBodyDataEntity;
        internal HealthDataImportHelper(UserBodyDataEntity? userBodyDataEntity)
        {
            _userBodyDataEntity = userBodyDataEntity;
        }

        internal decimal? GetHeight()
        {
            return _userBodyDataEntity?.Height;
        }

        internal decimal? GetWeight(Dictionary<DateTime, decimal?> weightDictionary, DateTime date)
        {
            if (date.Date > DateTime.Now.Date)
            {
                return _userBodyDataEntity?.Weight;
            }

            if (weightDictionary.TryGetValue(date.Date, out var weight) && weight.HasValue && weight != 0.00m)
            {
                return weight;
            }

            return GetPreviousValueFromDictionary(weightDictionary, date.Date);
        }

        internal decimal? GetGetBodyFatPercentage(Dictionary<DateTime, decimal?> bodyFatDictionary, DateTime date)
        {
            if (bodyFatDictionary.TryGetValue(date.Date, out var bodyFat) && bodyFat.HasValue && bodyFat != 0.00m)
            {
                return bodyFat;
            }

            return GetPreviousValueFromDictionary(bodyFatDictionary, date.Date);
        }

        private static decimal? GetPreviousValueFromDictionary(Dictionary<DateTime, decimal?> dictionary, DateTime date)
        {
            // Find the closest earlier date that has a meaningful (non-null, non-zero) value, ordered from newest to oldest.
            return dictionary
                .Where(entry => entry.Key < date.Date && entry.Value.HasValue && entry.Value != 0.00m)
                .OrderByDescending(entry => entry.Key)
                .Select(entry => entry.Value)
                .FirstOrDefault();
        }
    }
}
