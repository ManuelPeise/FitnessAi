using Newtonsoft.Json;
using Shared.Enums.HealthConnect;
using Shared.Models.HealthConnect;
using Shared.Models.HealthConnect.ImportModels;

namespace Logic.Services.DataImport
{
    internal static class HealthConnectParsingFactory
    {
        internal static HealthConnectMetricResult ParseMetric(HealthConnectRecordTypeEnum recordType, string json)
        {
            switch (recordType)
            {
                case HealthConnectRecordTypeEnum.ActiveCaloriesBurned:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectActiveCaloriesBurnedMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BodyFat:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBodyFatMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.HeartRate:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectHeartRateMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Distance:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectDistanceMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.ElevationGained:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectElevationGainedMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.ExerciseSession:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectExerciseMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Weight:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectWeightMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BasalBodyTemperature:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBasalBodyTemperatureMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BasalMetabolicRate:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBasalMetabolicRateMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BloodGlucose:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBloodGlucoseMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BloodPressure:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBloodPressureMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BodyTemperature:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBodyTemperatureMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BodyWaterMass:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBodyWaterMassMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.BoneMass:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectBoneMassMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.CervicalMucus:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectCervicalMucusRecordMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.CyclingPedalingCadence:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectCadenceMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.FloorsClimbed:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectFloorsClimbedMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.HeartRateVariability:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HeartRateVariabilityMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Height:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectHeightMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Hydration:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectHydrationMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.IntermenstrualBleeding:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectIntermenstrualBleedingMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.LeanBodyMass:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectLeanBodyMassMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.MenstruationFlow:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectMenstruationFlowMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.MenstruationPeriod:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectMenstruationPeriodMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Nutrition:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectNutritionMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.OvulationTest:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectOvulationTestMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.OxygenSaturation:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectOxygenSaturationMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Power:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectPowerMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.RespiratoryRate:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectRespiratoryRateMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.RestingHeartRate:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectRestingHeartRateMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.SexualActivity:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectSexualActivityMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.SkinTemperature:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectSkinTemperatureMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.SleepSession:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectSleepSessionMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Speed:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectSpeedMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Steps:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectStepsMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.StepsCadence:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectStepsCadenceMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.TotalCaloriesBurned:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectTotalCaloriesBurnedMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.Vo2Max:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectVo2MaxMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.WheelchairPushes:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectWheelchairPushesMetric>(json)
                    };
                case HealthConnectRecordTypeEnum.HeartRateVariabilityRmssd:
                    return new HealthConnectMetricResult
                    {
                        RecordType = recordType,
                        Records = ParseMetrics<HealthConnectHeartRateVariabilityRmssdMetric>(json)
                    };
                default:
                    throw new NotImplementedException($"Parsing for record type '{recordType}' is not implemented.");
            }
        }

        private static List<AHealthConnectMetricBase> ParseMetrics<TModel>(string json) where TModel : AHealthConnectMetricBase
        {
            var wrapper = JsonConvert.DeserializeObject<HealthConnectRecordsWrapper<TModel>>(json);

            return wrapper?.Records?.Cast<AHealthConnectMetricBase>().ToList() ?? new List<AHealthConnectMetricBase>();
        }
    }
}
