using Data.Database.Entities.HealthConnect;
using Microsoft.Extensions.Logging;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;

namespace Logic.Services.DataImport
{
    internal sealed class MetricProcessor
    {
        private readonly ILogger _logger;

        public MetricProcessor(ILogger logger)
        {
            _logger = logger;
        }

        public List<HealthConnectRecordEntity> ProcessMetric(HealthConnectMetricResult model, long userId)
        {
            switch (model.RecordType)
            {
                case HealthConnectRecordTypeEnum.ActiveCaloriesBurned:
                    return ProcessActiveCaloriesBurned(model, userId);
                case HealthConnectRecordTypeEnum.BasalBodyTemperature:
                    return ProcessBasalBodyTemperature(model, userId);
                case HealthConnectRecordTypeEnum.BasalMetabolicRate:
                    return ProcessBasalMetabolicRate(model, userId);
                case HealthConnectRecordTypeEnum.BloodGlucose:
                    return ProcessBloodGlucose(model, userId);
                case HealthConnectRecordTypeEnum.BloodPressure:
                    return ProcessBloodPressure(model, userId);
                case HealthConnectRecordTypeEnum.BodyFat:
                    return ProcessBodyFat(model, userId);
                case HealthConnectRecordTypeEnum.BodyTemperature:
                    return ProcessBodyTemperature(model, userId);
                case HealthConnectRecordTypeEnum.BodyWaterMass:
                    return ProcessBodyWaterMass(model, userId);
                case HealthConnectRecordTypeEnum.BoneMass:
                    return ProcessBoneMass(model, userId);
                case HealthConnectRecordTypeEnum.CervicalMucus:
                    return ProcessCervicalMucus(model, userId);
                case HealthConnectRecordTypeEnum.CyclingPedalingCadence:
                    return ProcessCyclingPedalingCadence(model, userId);
                case HealthConnectRecordTypeEnum.Distance:
                    return ProcessDistance(model, userId);
                case HealthConnectRecordTypeEnum.ElevationGained:
                    return ProcessElevationGained(model, userId);
                case HealthConnectRecordTypeEnum.ExerciseSession:
                    return ProcessExerciseSession(model, userId);
                case HealthConnectRecordTypeEnum.FloorsClimbed:
                    return ProcessFloorsClimbed(model, userId);
                case HealthConnectRecordTypeEnum.HeartRate:
                    return ProcessHeartRate(model, userId);
                case HealthConnectRecordTypeEnum.HeartRateVariability:
                    return ProcessHeartRateVariability(model, userId);
                case HealthConnectRecordTypeEnum.Height:
                    return ProcessHeight(model, userId);
                case HealthConnectRecordTypeEnum.Hydration:
                    return ProcessHydration(model, userId);
                case HealthConnectRecordTypeEnum.IntermenstrualBleeding:
                    return ProcessIntermenstrualBleeding(model, userId);
                case HealthConnectRecordTypeEnum.LeanBodyMass:
                    return ProcessLeanBodyMass(model, userId);
                case HealthConnectRecordTypeEnum.MenstruationFlow:
                    return ProcessMenstruationFlow(model, userId);
                case HealthConnectRecordTypeEnum.MenstruationPeriod:
                    return ProcessMenstruationPeriod(model, userId);
                case HealthConnectRecordTypeEnum.Nutrition:
                    return ProcessNutrition(model, userId);
                case HealthConnectRecordTypeEnum.OvulationTest:
                    return ProcessOvulationTest(model, userId);
                case HealthConnectRecordTypeEnum.OxygenSaturation:
                    return ProcessOxygenSaturation(model, userId);
                case HealthConnectRecordTypeEnum.Power:
                    return ProcessPower(model, userId);
                case HealthConnectRecordTypeEnum.RespiratoryRate:
                    return ProcessRespiratoryRate(model, userId);
                case HealthConnectRecordTypeEnum.RestingHeartRate:
                    return ProcessRestingHeartRate(model, userId);
                case HealthConnectRecordTypeEnum.SexualActivity:
                    return ProcessSexualActivity(model, userId);
                case HealthConnectRecordTypeEnum.SkinTemperature:
                    return ProcessSkinTemperature(model, userId);
                case HealthConnectRecordTypeEnum.SleepSession:
                    return ProcessSleepSession(model, userId);
                case HealthConnectRecordTypeEnum.Speed:
                    return ProcessSpeed(model, userId);
                case HealthConnectRecordTypeEnum.Steps:
                    return ProcessSteps(model, userId);
                case HealthConnectRecordTypeEnum.StepsCadence:
                    return ProcessStepsCadence(model, userId);
                case HealthConnectRecordTypeEnum.TotalCaloriesBurned:
                    return ProcessTotalCaloriesBurned(model, userId);
                case HealthConnectRecordTypeEnum.Vo2Max:
                    return ProcessVo2Max(model, userId);
                case HealthConnectRecordTypeEnum.Weight:
                    return ProcessWeight(model, userId);
                case HealthConnectRecordTypeEnum.WheelchairPushes:
                    return ProcessWheelchairPushes(model, userId);
                case HealthConnectRecordTypeEnum.HeartRateVariabilityRmssd:
                    return ProcessHeartRateVariabilityRmssd(model, userId);
                default:
                    _logger.LogWarning(
                        "Health data import skipped unsupported record type {RecordType} for user {UserId}.",
                        model.RecordType,
                        userId);
                    return new List<HealthConnectRecordEntity>();
            }
        }

        private List<HealthConnectRecordEntity> ProcessActiveCaloriesBurned(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectActiveCaloriesBurnedMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.ActiveCaloriesBurned, HealthConnectUnitTypeEnum.Kilocalories, metric.Energy.InKilocalories);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBasalBodyTemperature(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBasalBodyTemperatureMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BasalBodyTemperature, HealthConnectUnitTypeEnum.Celsius, metric.Temperature.InCelsius, categoryValue: (int)metric.MeasurementLocation);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBasalMetabolicRate(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBasalMetabolicRateMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BasalMetabolicRate, HealthConnectUnitTypeEnum.KilocaloriesPerDay, metric.MetabolicRate.InKilocaloriesPerDay);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBloodGlucose(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBloodGlucoseMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BloodGlucose, HealthConnectUnitTypeEnum.MillimolesPerLiter, metric.Level.InMillimolesPerLiter, categoryValue: metric.MealType);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBloodPressure(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBloodPressureMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BloodPressureSystolic, HealthConnectUnitTypeEnum.MillimetersOfMercury, metric.Systolic.InMillimetersOfMercury, categoryValue: (int)metric.BodyPosition);
                AddValue(record, HealthConnectValueTypeEnum.BloodPressureDiastolic, HealthConnectUnitTypeEnum.MillimetersOfMercury, metric.Diastolic.InMillimetersOfMercury, categoryValue: (int)metric.BodyPosition);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBodyFat(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBodyFatMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BodyFat, HealthConnectUnitTypeEnum.Percent, metric.Percentage);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBodyTemperature(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBodyTemperatureMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BodyTemperature, HealthConnectUnitTypeEnum.Celsius, metric.Temperature.InCelsius, categoryValue: (int)metric.MeasurementLocation);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBodyWaterMass(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBodyWaterMassMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BodyWaterMass, HealthConnectUnitTypeEnum.Kilograms, metric.Mass.InKilograms);
            });
        }

        private List<HealthConnectRecordEntity> ProcessBoneMass(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectBoneMassMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.BoneMass, HealthConnectUnitTypeEnum.Kilograms, metric.Mass.InKilograms);
            });
        }

        private List<HealthConnectRecordEntity> ProcessCervicalMucus(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectCervicalMucusRecordMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.CervicalMucus, HealthConnectUnitTypeEnum.Count, metric.Appearance, categoryValue: metric.Appearance);
            });
        }

        private List<HealthConnectRecordEntity> ProcessCyclingPedalingCadence(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectCadenceMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.CyclingPedalingCadence, HealthConnectUnitTypeEnum.RevolutionsPerMinute, metric.RevolutionsPerMinute);
            });
        }

        private List<HealthConnectRecordEntity> ProcessDistance(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectDistanceMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Distance, HealthConnectUnitTypeEnum.Meters, metric.Distance.InMeters);
            });
        }

        private List<HealthConnectRecordEntity> ProcessElevationGained(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectElevationGainedMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.ElevationGained, HealthConnectUnitTypeEnum.Meters, metric.Elevation.InMeters);
            });
        }

        private List<HealthConnectRecordEntity> ProcessExerciseSession(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectExerciseMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.ExerciseSession, HealthConnectUnitTypeEnum.Count, (int)metric.ExerciseType,
                    textValue: metric.Title ?? metric.Notes, categoryValue: (int)metric.ExerciseType);

                if (metric.RateOfPerceivedExertion.HasValue)
                {
                    AddValue(record, HealthConnectValueTypeEnum.ExerciseSession, HealthConnectUnitTypeEnum.Count, metric.RateOfPerceivedExertion.Value);
                }

                foreach (var segment in metric.Segments)
                {
                    record.Segments.Add(new HealthConnectSegmentEntity
                    {
                        StartTime = segment.StartTime,
                        EndTime = segment.EndTime,
                        SegmentType = (int)segment.SegmentType,
                        RepetitionCount = segment.Repetitions,
                        Record = record
                    });
                }

                foreach (var lap in metric.Laps)
                {
                    record.Segments.Add(new HealthConnectSegmentEntity
                    {
                        SegmentType = 0,
                        Record = record
                    });
                }
            });
        }

        private List<HealthConnectRecordEntity> ProcessFloorsClimbed(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectFloorsClimbedMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.FloorsClimbed, HealthConnectUnitTypeEnum.Count, metric.Floors);
            });
        }

        private List<HealthConnectRecordEntity> ProcessHeartRate(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectHeartRateMetric>(model, userId, (metric, record) =>
            {
                foreach (var sample in metric.Samples)
                {
                    AddValue(record, HealthConnectValueTypeEnum.HeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute, sample.BeatsPerMinute, timeStamp: sample.Time);
                }
            });
        }

        private List<HealthConnectRecordEntity> ProcessHeartRateVariability(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HeartRateVariabilityMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.HeartRateVariability, HealthConnectUnitTypeEnum.Milliseconds, metric.HeartRateVariabilityMillis);
            });
        }

        private List<HealthConnectRecordEntity> ProcessHeight(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectHeightMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Height, HealthConnectUnitTypeEnum.Meters, metric.Height.InMeters);
            });
        }

        private List<HealthConnectRecordEntity> ProcessHydration(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectHydrationMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Hydration, HealthConnectUnitTypeEnum.Liters, metric.Volume.InLiters);
            });
        }

        private List<HealthConnectRecordEntity> ProcessIntermenstrualBleeding(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectIntermenstrualBleedingMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.IntermenstrualBleeding, HealthConnectUnitTypeEnum.Count, 1);
            });
        }

        private List<HealthConnectRecordEntity> ProcessLeanBodyMass(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectLeanBodyMassMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.LeanBodyMass, HealthConnectUnitTypeEnum.Kilograms, metric.Mass.InKilograms);
            });
        }

        private List<HealthConnectRecordEntity> ProcessMenstruationFlow(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectMenstruationFlowMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.MenstruationFlow, HealthConnectUnitTypeEnum.Count, metric.Flow, categoryValue: metric.Flow);
            });
        }

        private List<HealthConnectRecordEntity> ProcessMenstruationPeriod(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectMenstruationPeriodMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.MenstruationPeriod, HealthConnectUnitTypeEnum.Count, 1);
            });
        }

        private List<HealthConnectRecordEntity> ProcessNutrition(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectNutritionMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Energy, HealthConnectUnitTypeEnum.Kilocalories, metric.Energy.InKilocalories,
                    textValue: string.IsNullOrWhiteSpace(metric.Name) ? null : metric.Name, categoryValue: metric.MealType);
                AddValue(record, HealthConnectValueTypeEnum.EnergyFromFat, HealthConnectUnitTypeEnum.Kilocalories, metric.EnergyFromFat.InKilocalories);
                AddValue(record, HealthConnectValueTypeEnum.TotalCarbohydrate, HealthConnectUnitTypeEnum.Grams, metric.TotalCarbohydrate.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.TotalFat, HealthConnectUnitTypeEnum.Grams, metric.TotalFat.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.SaturatedFat, HealthConnectUnitTypeEnum.Grams, metric.SaturatedFat.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.TransFat, HealthConnectUnitTypeEnum.Grams, metric.TransFat.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.Protein, HealthConnectUnitTypeEnum.Grams, metric.Protein.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.DietaryFiber, HealthConnectUnitTypeEnum.Grams, metric.DietaryFiber.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.Sodium, HealthConnectUnitTypeEnum.Milligrams, metric.Sodium.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.Sugar, HealthConnectUnitTypeEnum.Grams, metric.Sugar.InGrams);
                AddValue(record, HealthConnectValueTypeEnum.Potassium, HealthConnectUnitTypeEnum.Milligrams, metric.Potassium.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.Cholesterol, HealthConnectUnitTypeEnum.Milligrams, metric.Cholesterol.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.Calcium, HealthConnectUnitTypeEnum.Milligrams, metric.Calcium.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.Iron, HealthConnectUnitTypeEnum.Milligrams, metric.Iron.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.Magnesium, HealthConnectUnitTypeEnum.Milligrams, metric.Magnesium.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.Zinc, HealthConnectUnitTypeEnum.Milligrams, metric.Zinc.InMilligrams);
                AddValue(record, HealthConnectValueTypeEnum.VitaminA, HealthConnectUnitTypeEnum.Micrograms, metric.VitaminA.InMicrograms);
                AddValue(record, HealthConnectValueTypeEnum.VitaminC, HealthConnectUnitTypeEnum.Milligrams, metric.VitaminC.InMilligrams);
            });
        }

        private List<HealthConnectRecordEntity> ProcessOvulationTest(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectOvulationTestMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.OvulationTest, HealthConnectUnitTypeEnum.Count, metric.Result, categoryValue: metric.Result);
            });
        }

        private List<HealthConnectRecordEntity> ProcessOxygenSaturation(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectOxygenSaturationMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.OxygenSaturation, HealthConnectUnitTypeEnum.Percent, (decimal)metric.Percentage);
            });
        }

        private List<HealthConnectRecordEntity> ProcessPower(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectPowerMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Power, HealthConnectUnitTypeEnum.Watts, metric.Power.InWatts);
            });
        }

        private List<HealthConnectRecordEntity> ProcessRespiratoryRate(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectRespiratoryRateMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.RespiratoryRate, HealthConnectUnitTypeEnum.BreathsPerMinute, metric.Rate);
            });
        }

        private List<HealthConnectRecordEntity> ProcessRestingHeartRate(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectRestingHeartRateMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.RestingHeartRate, HealthConnectUnitTypeEnum.BeatsPerMinute, metric.BeatsPerMinute);
            });
        }

        private List<HealthConnectRecordEntity> ProcessSexualActivity(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectSexualActivityMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.SexualActivity, HealthConnectUnitTypeEnum.Count, metric.ProtectionUsed, categoryValue: metric.ProtectionUsed);
            });
        }

        private List<HealthConnectRecordEntity> ProcessSkinTemperature(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectSkinTemperatureMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.SkinTemperature, HealthConnectUnitTypeEnum.Celsius, metric.Delta.InCelsius, categoryValue: metric.Location);
            });
        }

        private List<HealthConnectRecordEntity> ProcessSleepSession(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectSleepSessionMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.SleepSession, HealthConnectUnitTypeEnum.Count, 1,
                    textValue: string.IsNullOrWhiteSpace(metric.Title) ? null : metric.Title);
            });
        }

        private List<HealthConnectRecordEntity> ProcessSpeed(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectSpeedMetric>(model, userId, (metric, record) =>
            {
                foreach (var sample in metric.Samples)
                {
                    AddValue(record, HealthConnectValueTypeEnum.Speed, HealthConnectUnitTypeEnum.MetersPerSecond, sample.InMetersPerSecond);
                }
            });
        }

        private List<HealthConnectRecordEntity> ProcessSteps(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectStepsMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Steps, HealthConnectUnitTypeEnum.Count, metric.Count);
            });
        }

        private List<HealthConnectRecordEntity> ProcessStepsCadence(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectStepsCadenceMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.StepsCadence, HealthConnectUnitTypeEnum.StepsPerMinute, (decimal)metric.Rate);
            });
        }

        private List<HealthConnectRecordEntity> ProcessTotalCaloriesBurned(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectTotalCaloriesBurnedMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.TotalCaloriesBurned, HealthConnectUnitTypeEnum.Kilocalories, metric.Energy.InKilocalories);
            });
        }

        private List<HealthConnectRecordEntity> ProcessVo2Max(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectVo2MaxMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Vo2Max, HealthConnectUnitTypeEnum.MillilitersPerKilogramPerMinute, metric.Vo2MillilitersPerMinuteKilogram, categoryValue: metric.MeasurementMethod);
            });
        }

        private List<HealthConnectRecordEntity> ProcessWeight(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectWeightMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.Weight, HealthConnectUnitTypeEnum.Kilograms, metric.WeightData.InKilograms);
            });
        }

        private List<HealthConnectRecordEntity> ProcessWheelchairPushes(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectWheelchairPushesMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.WheelchairPushes, HealthConnectUnitTypeEnum.Count, metric.Count);
            });
        }

        private List<HealthConnectRecordEntity> ProcessHeartRateVariabilityRmssd(HealthConnectMetricResult model, long userId)
        {
            return MapRecords<HealthConnectHeartRateVariabilityRmssdMetric>(model, userId, (metric, record) =>
            {
                AddValue(record, HealthConnectValueTypeEnum.HeartRateVariability, HealthConnectUnitTypeEnum.Milliseconds, metric.HeartRateVariabilityMillis);
            });
        }

        /// <summary>
        /// Casts the raw metric list to the concrete metric type, creates a parent record entity
        /// for every metric and delegates value/segment population to the provided mapper.
        /// </summary>
        private List<HealthConnectRecordEntity> MapRecords<TModel>(
            HealthConnectMetricResult model,
            long userId,
            Action<TModel, HealthConnectRecordEntity> mapper)
            where TModel : AHealthConnectMetricBase
        {
            var entities = new List<HealthConnectRecordEntity>();
            var metrics = CastMetric<TModel>(model.Records);

            if (metrics == null || metrics.Count == 0)
            {
                return entities;
            }

            foreach (var metric in metrics)
            {
                var record = CreateRecord(metric, model.RecordType, userId);
                mapper(metric, record);
                entities.Add(record);
            }

            return entities;
        }

        private static HealthConnectRecordEntity CreateRecord(AHealthConnectMetricBase metric, HealthConnectRecordTypeEnum recordType, long userId)
        {
            var metaData = metric.MetaData;

            return new HealthConnectRecordEntity
            {
                UserId = userId,
                RecordType = recordType,
                ClientRecordId = metaData?.ClientRecordId ?? metaData?.Id ?? string.Empty,
                ClientRecordVersion = metaData?.ClientRecordVersion ?? 0,
                Origin = metaData?.DataOrigin ?? string.Empty,
                RecordingMethod = metaData?.RecordingMethod ?? 0,
                TimeZoneOffset = metric.StartZoneOffset?.TotalSeconds ?? 0,
                StartTime = metric.StartTime ?? metric.Time,
                EndTime = metric.EndTime ?? metric.Time
            };
        }

        private static void AddValue(
            HealthConnectRecordEntity record,
            HealthConnectValueTypeEnum valueType,
            HealthConnectUnitTypeEnum unitType,
            decimal value,
            DateTimeOffset? timeStamp = null,
            string? textValue = null,
            int? categoryValue = null)
        {
            record.Values.Add(new HealthConnectValueEntity
            {
                Value = value,
                ValueType = valueType,
                UnitType = unitType,
                TimeStamp = timeStamp,
                TextValue = textValue,
                CategoryValue = categoryValue,
                Record = record
            });
        }

        private static List<TModel> CastMetric<TModel>(List<AHealthConnectMetricBase> model) where TModel : AHealthConnectMetricBase
        {
            ArgumentNullException.ThrowIfNull(model);

            return model.Cast<TModel>().ToList();
        }
    }
}
