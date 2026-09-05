import { ReadRecordsResult, RecordType } from 'react-native-health-connect';
import {
  HealthConnectDataEntry,
  HealthConnectDataUnitEnum,
  HealthConnectRecordTypeEnum,
} from './scheduleTypes';

type GenericRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === 'object' && value !== null;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const unitValue = (value: unknown, key: string, fallback = 0): number =>
  isRecord(value) ? asNumber(value[key], fallback) : fallback;

const entry = (
  type: HealthConnectRecordTypeEnum,
  unit: HealthConnectDataUnitEnum,
  value: number,
  startTimestamp: string,
  endTimestamp: string,
): HealthConnectDataEntry => ({
  type,
  unit,
  value,
  startTimestamp,
  endTimestamp,
});

export const mapMetric = (
  type: RecordType,
  result: ReadRecordsResult<RecordType>,
): HealthConnectDataEntry[] => {
  const records = result.records as unknown as GenericRecord[];

  switch (type) {
    case 'ActiveCaloriesBurned':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);

        if (!start || !end) {
          return [];
        }

        return entry(
          HealthConnectRecordTypeEnum.ActiveCaloriesBurned,
          HealthConnectDataUnitEnum.KILOCALORIES,
          unitValue(record.energy, 'inKilocalories'),
          start,
          end,
        );
      });
    case 'BasalBodyTemperature':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BasalBodyTemperature,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.temperature, 'inCelsius'),
          time,
          time,
        );
      });
    case 'BasalMetabolicRate':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BasalMetabolicRate,
          HealthConnectDataUnitEnum.KILOCALORIES,
          unitValue(record.basalMetabolicRate, 'inKilocaloriesPerDay'),
          time,
          time,
        );
      });
    case 'BloodGlucose':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BloodGlucose,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.level, 'inMilligramsPerDeciliter'),
          time,
          time,
        );
      });
    case 'BloodPressure':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }

        const systolic = unitValue(record.systolic, 'inMillimetersOfMercury', NaN);
        const diastolic = unitValue(record.diastolic, 'inMillimetersOfMercury', NaN);
        const value = Number.isFinite(systolic)
          ? systolic
          : Number.isFinite(diastolic)
          ? diastolic
          : 0;

        return entry(
          HealthConnectRecordTypeEnum.BloodPressure,
          HealthConnectDataUnitEnum.RATE,
          value,
          time,
          time,
        );
      });
    case 'BodyFat':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BodyFat,
          HealthConnectDataUnitEnum.PERCENTAGE,
          asNumber(record.percentage),
          time,
          time,
        );
      });
    case 'BodyTemperature':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BodyTemperature,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.temperature, 'inCelsius'),
          time,
          time,
        );
      });
    case 'BodyWaterMass':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BodyWaterMass,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.mass, 'inKilograms'),
          time,
          time,
        );
      });
    case 'BoneMass':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.BoneMass,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.mass, 'inKilograms'),
          time,
          time,
        );
      });
    case 'CervicalMucus':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.CervicalMucus,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.appearance, asNumber(record.sensation, 1)),
          time,
          time,
        );
      });
    case 'CyclingPedalingCadence':
      return records.flatMap(record => {
        const samples = Array.isArray(record.samples) ? record.samples : [];
        return samples.flatMap(sample => {
          if (!isRecord(sample)) {
            return [];
          }
          const time = asString(sample.time);
          if (!time) {
            return [];
          }
          return entry(
            HealthConnectRecordTypeEnum.CyclingPedalingCadence,
            HealthConnectDataUnitEnum.REVOLUTIONS_PER_MINUTE,
            asNumber(sample.revolutionsPerMinute),
            time,
            time,
          );
        });
      });
    case 'Distance':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.Distance,
          HealthConnectDataUnitEnum.METERS,
          unitValue(record.distance, 'inMeters'),
          start,
          end,
        );
      });
    case 'ElevationGained':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.ElevationGained,
          HealthConnectDataUnitEnum.METERS,
          unitValue(record.elevation, 'inMeters'),
          start,
          end,
        );
      });
    case 'ExerciseSession':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        const startMs = Date.parse(start);
        const endMs = Date.parse(end);
        const durationMinutes =
          Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
            ? (endMs - startMs) / 60000
            : 0;
        return entry(
          HealthConnectRecordTypeEnum.ExerciseSession,
          HealthConnectDataUnitEnum.RATE,
          durationMinutes,
          start,
          end,
        );
      });
    case 'FloorsClimbed':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.FloorsClimbed,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.floors),
          start,
          end,
        );
      });
    case 'HeartRate':
      return records.flatMap(record => {
        const samples = Array.isArray(record.samples) ? record.samples : [];
        return samples.flatMap(sample => {
          if (!isRecord(sample)) {
            return [];
          }
          const time = asString(sample.time);
          if (!time) {
            return [];
          }
          return entry(
            HealthConnectRecordTypeEnum.HeartRate,
            HealthConnectDataUnitEnum.BEATS_PER_MINUTE,
            asNumber(sample.beatsPerMinute),
            time,
            time,
          );
        });
      });
    case 'Height':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.Height,
          HealthConnectDataUnitEnum.METERS,
          unitValue(record.height, 'inMeters'),
          time,
          time,
        );
      });
    case 'HeartRateVariabilityRmssd':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.HeartRateVariabilityRmssd,
          HealthConnectDataUnitEnum.MILLIS,
          asNumber(record.heartRateVariabilityMillis),
          time,
          time,
        );
      });
    case 'Hydration':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.Hydration,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.volume, 'inLiters'),
          start,
          end,
        );
      });
    case 'IntermenstrualBleeding':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.IntermenstrualBleeding,
          HealthConnectDataUnitEnum.RATE,
          1,
          time,
          time,
        );
      });
    case 'LeanBodyMass':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.LeanBodyMass,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.mass, 'inKilograms'),
          time,
          time,
        );
      });
    case 'MenstruationFlow':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.MenstruationFlow,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.flow, 1),
          time,
          time,
        );
      });
    case 'MenstruationPeriod':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.MenstruationPeriod,
          HealthConnectDataUnitEnum.RATE,
          1,
          start,
          end,
        );
      });
    case 'Nutrition':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        const value =
          unitValue(record.energy, 'inKilocalories', NaN) ||
          unitValue(record.energyFromFat, 'inKilocalories', NaN) ||
          unitValue(record.totalCarbohydrate, 'inGrams', NaN) ||
          unitValue(record.protein, 'inGrams', NaN) ||
          unitValue(record.totalFat, 'inGrams', 0);

        return entry(
          HealthConnectRecordTypeEnum.Nutrition,
          HealthConnectDataUnitEnum.KILOCALORIES,
          Number.isFinite(value) ? value : 0,
          start,
          end,
        );
      });
    case 'OvulationTest':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.OvulationTest,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.result, 1),
          time,
          time,
        );
      });
    case 'OxygenSaturation':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.OxygenSaturation,
          HealthConnectDataUnitEnum.PERCENTAGE,
          asNumber(record.percentage),
          time,
          time,
        );
      });
    case 'Power':
      return records.flatMap(record => {
        const samples = Array.isArray(record.samples) ? record.samples : [];
        return samples.flatMap(sample => {
          if (!isRecord(sample)) {
            return [];
          }
          const time = asString(sample.time);
          if (!time) {
            return [];
          }
          return entry(
            HealthConnectRecordTypeEnum.Power,
            HealthConnectDataUnitEnum.WATTS,
            unitValue(sample.power, 'inWatts'),
            time,
            time,
          );
        });
      });
    case 'RespiratoryRate':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.RespiratoryRate,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.rate),
          time,
          time,
        );
      });
    case 'RestingHeartRate':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.RestingHeartRate,
          HealthConnectDataUnitEnum.BEATS_PER_MINUTE,
          asNumber(record.beatsPerMinute),
          time,
          time,
        );
      });
    case 'SexualActivity':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        const raw = record.protectionUsed;
        const value =
          typeof raw === 'boolean' ? (raw ? 1 : 0) : asNumber(raw, 1);
        return entry(
          HealthConnectRecordTypeEnum.SexualActivity,
          HealthConnectDataUnitEnum.RATE,
          value,
          time,
          time,
        );
      });
    case 'SkinTemperature':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }

        const baseline = unitValue(record.baseline, 'inCelsius', NaN);
        const fallbackDelta =
          Array.isArray(record.deltas) && record.deltas.length > 0
            ? (() => {
                const delta = record.deltas.find(isRecord);
                return delta
                  ? unitValue(delta.delta, 'inCelsius', 0)
                  : 0;
              })()
            : 0;

        const value = Number.isFinite(baseline) ? baseline : fallbackDelta;

        return entry(
          HealthConnectRecordTypeEnum.SkinTemperature,
          HealthConnectDataUnitEnum.RATE,
          value,
          start,
          end,
        );
      });
    case 'SleepSession':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        const startMs = Date.parse(start);
        const endMs = Date.parse(end);
        const durationMinutes =
          Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
            ? (endMs - startMs) / 60000
            : 0;
        return entry(
          HealthConnectRecordTypeEnum.SleepSession,
          HealthConnectDataUnitEnum.RATE,
          durationMinutes,
          start,
          end,
        );
      });
    case 'Speed':
      return records.flatMap(record => {
        const samples = Array.isArray(record.samples) ? record.samples : [];
        return samples.flatMap(sample => {
          if (!isRecord(sample)) {
            return [];
          }
          const time = asString(sample.time);
          if (!time) {
            return [];
          }
          return entry(
            HealthConnectRecordTypeEnum.Speed,
            HealthConnectDataUnitEnum.KILOMETERS_PER_HOUR,
            unitValue(sample.speed, 'inKilometersPerHour'),
            time,
            time,
          );
        });
      });
    case 'Steps':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.Steps,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.count),
          start,
          end,
        );
      });
    case 'StepsCadence':
      return records.flatMap(record => {
        const samples = Array.isArray(record.samples) ? record.samples : [];
        return samples.flatMap(sample => {
          if (!isRecord(sample)) {
            return [];
          }
          const time = asString(sample.time);
          if (!time) {
            return [];
          }
          return entry(
            HealthConnectRecordTypeEnum.StepsCadence,
            HealthConnectDataUnitEnum.RATE,
            asNumber(sample.rate),
            time,
            time,
          );
        });
      });
    case 'TotalCaloriesBurned':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.TotalCaloriesBurned,
          HealthConnectDataUnitEnum.KILOCALORIES,
          unitValue(record.energy, 'inKilocalories'),
          start,
          end,
        );
      });
    case 'Vo2Max':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.Vo2Max,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.vo2MillilitersPerMinuteKilogram),
          time,
          time,
        );
      });
    case 'Weight':
      return records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.Weight,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.weight, 'inKilograms'),
          time,
          time,
        );
      });
    case 'WheelchairPushes':
      return records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          HealthConnectRecordTypeEnum.WheelchairPushes,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.count),
          start,
          end,
        );
      });
    default:
      return [];
  }
};
