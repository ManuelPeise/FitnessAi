import {
  ReadRecordsResult,
  RecordResult,
  RecordType,
} from 'react-native-health-connect';
import {
  ExerciseTypeEnum,
  HealthConnectDataEntry,
  HealthConnectDataUnitEnum,
  HealthConnectRecordTypeEnum,
} from './scheduleTypes';

type GenericRecord = Record<string, unknown> & { recordId?: string };

const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === 'object' && value !== null;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const unitValue = (value: unknown, key: string, fallback = 0): number =>
  isRecord(value) ? asNumber(value[key], fallback) : fallback;

const entry = (
  origin: string,
  type: HealthConnectRecordTypeEnum,
  unit: HealthConnectDataUnitEnum,
  value: number,
  startTimestamp: string,
  endTimestamp: string,
  exerciseId: string | null,
  recordId: string | null,
  exerciseType?: ExerciseTypeEnum,
): HealthConnectDataEntry => ({
  recordId,
  origin,
  type,
  unit,
  value,
  startTimestamp,
  endTimestamp,
  exerciseId,
  exerciseType,
});

export const mapMetric = (
  type: RecordType,
  result: ReadRecordsResult<RecordType>,
  exerciseId: string | null,
): HealthConnectDataEntry[] => {
  switch (type) {
    case 'ActiveCaloriesBurned':
      const activeCaloriesBurnedRecords =
        result as ReadRecordsResult<'ActiveCaloriesBurned'>;
      return activeCaloriesBurnedRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);

        if (!start || !end) {
          return [];
        }

        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.ActiveCaloriesBurned,
          HealthConnectDataUnitEnum.KILOCALORIES,
          unitValue(record.energy, 'inKilocalories'),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BasalBodyTemperature':
      const basalBodyTemperatureRecords =
        result as ReadRecordsResult<'BasalBodyTemperature'>;
      return basalBodyTemperatureRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BasalBodyTemperature,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.temperature, 'inCelsius'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BasalMetabolicRate':
      const basalMetabolicRateRecords =
        result as ReadRecordsResult<'BasalMetabolicRate'>;
      return basalMetabolicRateRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BasalMetabolicRate,
          HealthConnectDataUnitEnum.KILOCALORIES,
          unitValue(record.basalMetabolicRate, 'inKilocaloriesPerDay'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BloodGlucose':
      const bloodGlucoseRecords = result as ReadRecordsResult<'BloodGlucose'>;
      return bloodGlucoseRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BloodGlucose,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.level, 'inMilligramsPerDeciliter'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BloodPressure':
      const bloodPressureRecords = result as ReadRecordsResult<'BloodPressure'>;
      return bloodPressureRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }

        const systolic = unitValue(
          record.systolic,
          'inMillimetersOfMercury',
          NaN,
        );
        const diastolic = unitValue(
          record.diastolic,
          'inMillimetersOfMercury',
          NaN,
        );
        const value = Number.isFinite(systolic)
          ? systolic
          : Number.isFinite(diastolic)
          ? diastolic
          : 0;

        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BloodPressure,
          HealthConnectDataUnitEnum.RATE,
          value,
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BodyFat':
      const bodyFatRecords = result as ReadRecordsResult<'BodyFat'>;
      return bodyFatRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BodyFat,
          HealthConnectDataUnitEnum.PERCENTAGE,
          asNumber(record.percentage),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BodyTemperature':
      const bodyTemperatureRecords =
        result as ReadRecordsResult<'BodyTemperature'>;
      return bodyTemperatureRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BodyTemperature,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.temperature, 'inCelsius'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BodyWaterMass':
      const bodyWaterMassRecords = result as ReadRecordsResult<'BodyWaterMass'>;
      return bodyWaterMassRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BodyWaterMass,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.mass, 'inKilograms'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'BoneMass':
      const boneMassRecords = result as ReadRecordsResult<'BoneMass'>;
      return boneMassRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.BoneMass,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.mass, 'inKilograms'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'CervicalMucus':
      const cervicalMucusRecords = result as ReadRecordsResult<'CervicalMucus'>;
      return cervicalMucusRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.CervicalMucus,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.appearance, asNumber(record.sensation, 1)),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'CyclingPedalingCadence':
      const cyclingPedalingCadenceRecords =
        result as ReadRecordsResult<'CyclingPedalingCadence'>;
      return cyclingPedalingCadenceRecords.records.flatMap(record => {
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
            record.metadata?.dataOrigin ?? '',
            HealthConnectRecordTypeEnum.CyclingPedalingCadence,
            HealthConnectDataUnitEnum.REVOLUTIONS_PER_MINUTE,
            asNumber(sample.revolutionsPerMinute),
            time,
            time,
            exerciseId,
            record.metadata?.id ?? null,
          );
        });
      });
    case 'Distance':
      const distanceRecords = result as ReadRecordsResult<'Distance'>;
      return distanceRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Distance,
          HealthConnectDataUnitEnum.METERS,
          unitValue(record.distance, 'inMeters'),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'ElevationGained':
      const elevationGainedRecords =
        result as ReadRecordsResult<'ElevationGained'>;
      return elevationGainedRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.ElevationGained,
          HealthConnectDataUnitEnum.METERS,
          unitValue(record.elevation, 'inMeters'),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'ExerciseSession':
      const exerciseSessionRecords =
        result as ReadRecordsResult<'ExerciseSession'>;
      console.log(
        `Processing ExerciseSession records: ${exerciseSessionRecords.records.length}`,
      );
      return exerciseSessionRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);

        if (!start || !end) {
          console.log(
            `Invalid exercise session start or end time: start=${start}, end=${end}`,
          );
          return [];
        }

        const exerciseType: ExerciseTypeEnum =
          record.exerciseType as unknown as ExerciseTypeEnum;

        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.ExerciseSession,
          HealthConnectDataUnitEnum.RATE,
          0,
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
          exerciseType,
        );
      });
    case 'FloorsClimbed':
      const floorsClimbedRecords = result as ReadRecordsResult<'FloorsClimbed'>;
      return floorsClimbedRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.FloorsClimbed,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.floors),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'HeartRate':
      const heartRateRecords = result as ReadRecordsResult<'HeartRate'>;
      return heartRateRecords.records.flatMap(record => {
        const samples = Array.isArray(record.samples) ? record.samples : [];
        return samples.flatMap(sample => {
          if (!isRecord(sample)) {
            return [];
          }
          const time = asString(sample.time);

          console.log(
            `Processing HeartRate sample: time=${time}, beatsPerMinute=${sample.beatsPerMinute}`,
          );
          if (!time) {
            return [];
          }
          return entry(
            record.metadata?.dataOrigin ?? '',
            HealthConnectRecordTypeEnum.HeartRate,
            HealthConnectDataUnitEnum.BEATS_PER_MINUTE,
            asNumber(sample.beatsPerMinute),
            time,
            time,
            exerciseId,
            record.metadata?.id ?? null,
          );
        });
      });
    case 'Height':
      const heightRecords = result as ReadRecordsResult<'Height'>;
      return heightRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Height,
          HealthConnectDataUnitEnum.METERS,
          unitValue(record.height, 'inMeters'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'HeartRateVariabilityRmssd':
      const heartRateVariabilityRmssdRecords =
        result as ReadRecordsResult<'HeartRateVariabilityRmssd'>;
      return heartRateVariabilityRmssdRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.HeartRateVariabilityRmssd,
          HealthConnectDataUnitEnum.MILLIS,
          asNumber(record.heartRateVariabilityMillis),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'Hydration':
      const hydrationRecords = result as ReadRecordsResult<'Hydration'>;
      return hydrationRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Hydration,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.volume, 'inLiters'),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'IntermenstrualBleeding':
      const intermenstrualBleedingRecords =
        result as ReadRecordsResult<'IntermenstrualBleeding'>;
      return intermenstrualBleedingRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.IntermenstrualBleeding,
          HealthConnectDataUnitEnum.RATE,
          1,
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'LeanBodyMass':
      const leanBodyMassRecords = result as ReadRecordsResult<'LeanBodyMass'>;
      return leanBodyMassRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.LeanBodyMass,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.mass, 'inKilograms'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'MenstruationFlow':
      const menstruationFlowRecords =
        result as ReadRecordsResult<'MenstruationFlow'>;
      return menstruationFlowRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.MenstruationFlow,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.flow, 1),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'MenstruationPeriod':
      const menstruationPeriodRecords =
        result as ReadRecordsResult<'MenstruationPeriod'>;
      return menstruationPeriodRecords.records.flatMap(record => {
        const start = asString(record.time);
        const end = asString(record.time);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.MenstruationPeriod,
          HealthConnectDataUnitEnum.RATE,
          1,
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'Nutrition':
      const nutritionRecords = result as ReadRecordsResult<'Nutrition'>;
      return nutritionRecords.records.flatMap(record => {
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
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Nutrition,
          HealthConnectDataUnitEnum.KILOCALORIES,
          Number.isFinite(value) ? value : 0,
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'OvulationTest':
      const ovulationTestRecords = result as ReadRecordsResult<'OvulationTest'>;
      return ovulationTestRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.OvulationTest,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.result, 1),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'OxygenSaturation':
      const oxygenSaturationRecords =
        result as ReadRecordsResult<'OxygenSaturation'>;
      return oxygenSaturationRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.OxygenSaturation,
          HealthConnectDataUnitEnum.PERCENTAGE,
          asNumber(record.percentage),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'Power':
      const powerRecords = result as ReadRecordsResult<'Power'>;
      return powerRecords.records.flatMap(record => {
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
            record.metadata?.dataOrigin ?? '',
            HealthConnectRecordTypeEnum.Power,
            HealthConnectDataUnitEnum.WATTS,
            unitValue(sample.power, 'inWatts'),
            time,
            time,
            exerciseId,
            record.metadata?.id ?? null,
          );
        });
      });
    case 'RespiratoryRate':
      const respiratoryRateRecords =
        result as ReadRecordsResult<'RespiratoryRate'>;
      return respiratoryRateRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.RespiratoryRate,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.rate),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'RestingHeartRate':
      const restingHeartRateRecords =
        result as ReadRecordsResult<'RestingHeartRate'>;
      return restingHeartRateRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.RestingHeartRate,
          HealthConnectDataUnitEnum.BEATS_PER_MINUTE,
          asNumber(record.beatsPerMinute),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'SexualActivity':
      const sexualActivityRecords =
        result as ReadRecordsResult<'SexualActivity'>;
      return sexualActivityRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        const raw = record.protectionUsed;
        const value =
          typeof raw === 'boolean' ? (raw ? 1 : 0) : asNumber(raw, 1);
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.SexualActivity,
          HealthConnectDataUnitEnum.RATE,
          value,
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'SkinTemperature':
      const skinTemperatureRecords =
        result as ReadRecordsResult<'SkinTemperature'>;
      return skinTemperatureRecords.records.flatMap(record => {
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
                return delta ? unitValue(delta.delta, 'inCelsius', 0) : 0;
              })()
            : 0;

        const value = Number.isFinite(baseline) ? baseline : fallbackDelta;

        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.SkinTemperature,
          HealthConnectDataUnitEnum.RATE,
          value,
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'SleepSession':
      const sleepSessionRecords = result as ReadRecordsResult<'SleepSession'>;
      return sleepSessionRecords.records.flatMap(record => {
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
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.SleepSession,
          HealthConnectDataUnitEnum.RATE,
          durationMinutes,
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'Speed':
      const speedRecords = result as ReadRecordsResult<'Speed'>;
      return speedRecords.records.flatMap(record => {
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
            record.metadata?.dataOrigin ?? '',
            HealthConnectRecordTypeEnum.Speed,
            HealthConnectDataUnitEnum.KILOMETERS_PER_HOUR,
            unitValue(sample.speed, 'inKilometersPerHour'),
            time,
            time,
            exerciseId,
            record.metadata?.id ?? null,
          );
        });
      });
    case 'Steps':
      const stepsRecords = result as ReadRecordsResult<'Steps'>;
      return stepsRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Steps,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.count),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'StepsCadence':
      const stepsCadenceRecords = result as ReadRecordsResult<'StepsCadence'>;
      return stepsCadenceRecords.records.flatMap(record => {
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
            record.metadata?.dataOrigin ?? '',
            HealthConnectRecordTypeEnum.StepsCadence,
            HealthConnectDataUnitEnum.RATE,
            asNumber(sample.rate),
            time,
            time,
            exerciseId,
            record.metadata?.id ?? null,
          );
        });
      });
    case 'TotalCaloriesBurned':
      const totalCaloriesBurnedRecords =
        result as ReadRecordsResult<'TotalCaloriesBurned'>;
      return totalCaloriesBurnedRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.TotalCaloriesBurned,
          HealthConnectDataUnitEnum.KILOCALORIES,
          unitValue(record.energy, 'inKilocalories'),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'Vo2Max':
      const vo2MaxRecords = result as ReadRecordsResult<'Vo2Max'>;
      return vo2MaxRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Vo2Max,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.vo2MillilitersPerMinuteKilogram),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'Weight':
      const weightRecords = result as ReadRecordsResult<'Weight'>;
      return weightRecords.records.flatMap(record => {
        const time = asString(record.time);
        if (!time) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.Weight,
          HealthConnectDataUnitEnum.RATE,
          unitValue(record.weight, 'inKilograms'),
          time,
          time,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    case 'WheelchairPushes':
      const wheelchairPushesRecords =
        result as ReadRecordsResult<'WheelchairPushes'>;
      return wheelchairPushesRecords.records.flatMap(record => {
        const start = asString(record.startTime);
        const end = asString(record.endTime);
        if (!start || !end) {
          return [];
        }
        return entry(
          record.metadata?.dataOrigin ?? '',
          HealthConnectRecordTypeEnum.WheelchairPushes,
          HealthConnectDataUnitEnum.RATE,
          asNumber(record.count),
          start,
          end,
          exerciseId,
          record.metadata?.id ?? null,
        );
      });
    default:
      return [];
  }
};
