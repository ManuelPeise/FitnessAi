import type {
  ReadRecordsResult,
  RecordResult,
  RecordType,
} from 'react-native-health-connect';

export type HealthConnectMetricMapperResult = {
  startTime: Date;
  endTime: Date;
  metricName: string;
  value: number;
  unit: string;
};

type HealthConnectRecordValue = RecordResult<RecordType> &
  Record<string, unknown>;

type UnitValue = {
  value: number;
  unit: string;
};

type UnitValueField = {
  fieldName: string;
  metricName: string;
  unit: string;
  valueKey: string;
};

const nutritionFields: UnitValueField[] = [
  { fieldName: 'biotin', metricName: 'Biotin', unit: 'g', valueKey: 'inGrams' },
  {
    fieldName: 'caffeine',
    metricName: 'Caffeine',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'calcium',
    metricName: 'Calcium',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'energy',
    metricName: 'Nutrition Energy',
    unit: 'kcal',
    valueKey: 'inKilocalories',
  },
  {
    fieldName: 'energyFromFat',
    metricName: 'Energy From Fat',
    unit: 'kcal',
    valueKey: 'inKilocalories',
  },
  {
    fieldName: 'chloride',
    metricName: 'Chloride',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'cholesterol',
    metricName: 'Cholesterol',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'chromium',
    metricName: 'Chromium',
    unit: 'g',
    valueKey: 'inGrams',
  },
  { fieldName: 'copper', metricName: 'Copper', unit: 'g', valueKey: 'inGrams' },
  {
    fieldName: 'dietaryFiber',
    metricName: 'Dietary Fiber',
    unit: 'g',
    valueKey: 'inGrams',
  },
  { fieldName: 'folate', metricName: 'Folate', unit: 'g', valueKey: 'inGrams' },
  {
    fieldName: 'folicAcid',
    metricName: 'Folic Acid',
    unit: 'g',
    valueKey: 'inGrams',
  },
  { fieldName: 'iodine', metricName: 'Iodine', unit: 'g', valueKey: 'inGrams' },
  { fieldName: 'iron', metricName: 'Iron', unit: 'g', valueKey: 'inGrams' },
  {
    fieldName: 'magnesium',
    metricName: 'Magnesium',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'manganese',
    metricName: 'Manganese',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'molybdenum',
    metricName: 'Molybdenum',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'monounsaturatedFat',
    metricName: 'Monounsaturated Fat',
    unit: 'g',
    valueKey: 'inGrams',
  },
  { fieldName: 'niacin', metricName: 'Niacin', unit: 'g', valueKey: 'inGrams' },
  {
    fieldName: 'pantothenicAcid',
    metricName: 'Pantothenic Acid',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'phosphorus',
    metricName: 'Phosphorus',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'polyunsaturatedFat',
    metricName: 'Polyunsaturated Fat',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'potassium',
    metricName: 'Potassium',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'protein',
    metricName: 'Protein',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'riboflavin',
    metricName: 'Riboflavin',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'saturatedFat',
    metricName: 'Saturated Fat',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'selenium',
    metricName: 'Selenium',
    unit: 'g',
    valueKey: 'inGrams',
  },
  { fieldName: 'sodium', metricName: 'Sodium', unit: 'g', valueKey: 'inGrams' },
  { fieldName: 'sugar', metricName: 'Sugar', unit: 'g', valueKey: 'inGrams' },
  {
    fieldName: 'thiamin',
    metricName: 'Thiamin',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'totalCarbohydrate',
    metricName: 'Total Carbohydrate',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'totalFat',
    metricName: 'Total Fat',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'transFat',
    metricName: 'Trans Fat',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'unsaturatedFat',
    metricName: 'Unsaturated Fat',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminA',
    metricName: 'Vitamin A',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminB12',
    metricName: 'Vitamin B12',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminB6',
    metricName: 'Vitamin B6',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminC',
    metricName: 'Vitamin C',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminD',
    metricName: 'Vitamin D',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminE',
    metricName: 'Vitamin E',
    unit: 'g',
    valueKey: 'inGrams',
  },
  {
    fieldName: 'vitaminK',
    metricName: 'Vitamin K',
    unit: 'g',
    valueKey: 'inGrams',
  },
  { fieldName: 'zinc', metricName: 'Zinc', unit: 'g', valueKey: 'inGrams' },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const getUnitValue = (
  value: unknown,
  valueKey: string,
  unit: string,
): UnitValue | null => {
  if (!isRecord(value)) {
    return null;
  }

  const numericValue = getNumber(value[valueKey]);

  return numericValue === null ? null : { value: numericValue, unit };
};

const getRecordRange = (record: HealthConnectRecordValue) => {
  const startTime =
    typeof record.startTime === 'string' ? record.startTime : record.time;
  const endTime =
    typeof record.endTime === 'string' ? record.endTime : startTime;

  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    return null;
  }

  return {
    startTime: new Date(startTime),
    endTime: new Date(endTime),
  };
};

const createMappedMetric = (
  record: HealthConnectRecordValue,
  metricName: string,
  value: number,
  unit: string,
): HealthConnectMetricMapperResult[] => {
  const range = getRecordRange(record);

  if (range === null) {
    return [];
  }

  return [{ ...range, metricName, value, unit }];
};

const mapUnitValueField = (
  record: HealthConnectRecordValue,
  fieldName: string,
  metricName: string,
  valueKey: string,
  unit: string,
): HealthConnectMetricMapperResult[] => {
  const unitValue = getUnitValue(record[fieldName], valueKey, unit);

  if (unitValue === null) {
    return [];
  }

  return createMappedMetric(
    record,
    metricName,
    unitValue.value,
    unitValue.unit,
  );
};

const mapNumericField = (
  record: HealthConnectRecordValue,
  fieldName: string,
  metricName: string,
  unit: string,
): HealthConnectMetricMapperResult[] => {
  const value = getNumber(record[fieldName]);

  if (value === null) {
    return [];
  }

  return createMappedMetric(record, metricName, value, unit);
};

const mapSamples = (
  record: HealthConnectRecordValue,
  sampleMapper: (
    sample: Record<string, unknown>,
  ) => HealthConnectMetricMapperResult[],
): HealthConnectMetricMapperResult[] => {
  if (!Array.isArray(record.samples)) {
    return [];
  }

  return record.samples.flatMap(sample =>
    isRecord(sample) ? sampleMapper(sample) : [],
  );
};

const mapSampleMetric = (
  sample: Record<string, unknown>,
  metricName: string,
  value: number,
  unit: string,
): HealthConnectMetricMapperResult[] => {
  if (typeof sample.time !== 'string') {
    return [];
  }

  const time = new Date(sample.time);

  return [{ startTime: time, endTime: time, metricName, value, unit }];
};

const mapNutrition = (
  record: HealthConnectRecordValue,
): HealthConnectMetricMapperResult[] =>
  nutritionFields.flatMap(field =>
    mapUnitValueField(
      record,
      field.fieldName,
      field.metricName,
      field.valueKey,
      field.unit,
    ),
  );

const mapRecord = <TMetric extends RecordType>(
  metricType: TMetric,
  record: RecordResult<TMetric>,
): HealthConnectMetricMapperResult[] => {
  const metricRecord = record as HealthConnectRecordValue;

  switch (metricType) {
    case 'ActiveCaloriesBurned':
      return mapUnitValueField(
        metricRecord,
        'energy',
        metricType,
        'inKilocalories',
        'kcal',
      );
    case 'BasalBodyTemperature':
    case 'BodyTemperature':
      return mapUnitValueField(
        metricRecord,
        'temperature',
        metricType,
        'inCelsius',
        'celsius',
      );
    case 'BasalMetabolicRate':
      return mapUnitValueField(
        metricRecord,
        'basalMetabolicRate',
        metricType,
        'inKilocaloriesPerDay',
        'kcal/day',
      );
    case 'BloodGlucose':
      return mapUnitValueField(
        metricRecord,
        'level',
        metricType,
        'inMilligramsPerDeciliter',
        'mg/dL',
      );
    case 'BloodPressure':
      return [
        ...mapUnitValueField(
          metricRecord,
          'systolic',
          'Systolic Blood Pressure',
          'inMillimetersOfMercury',
          'mmHg',
        ),
        ...mapUnitValueField(
          metricRecord,
          'diastolic',
          'Diastolic Blood Pressure',
          'inMillimetersOfMercury',
          'mmHg',
        ),
      ];
    case 'BodyFat':
    case 'OxygenSaturation':
      return mapNumericField(metricRecord, 'percentage', metricType, '%');
    case 'BodyWaterMass':
    case 'BoneMass':
    case 'LeanBodyMass':
      return mapUnitValueField(
        metricRecord,
        'mass',
        metricType,
        'inKilograms',
        'kg',
      );
    case 'CyclingPedalingCadence':
      return mapSamples(metricRecord, sample => {
        const value = getNumber(sample.revolutionsPerMinute);
        return value === null
          ? []
          : mapSampleMetric(sample, metricType, value, 'rpm');
      });
    case 'Distance':
      return mapUnitValueField(
        metricRecord,
        'distance',
        metricType,
        'inMeters',
        'm',
      );
    case 'ElevationGained':
      return mapUnitValueField(
        metricRecord,
        'elevation',
        metricType,
        'inMeters',
        'm',
      );
    case 'FloorsClimbed':
      return mapNumericField(metricRecord, 'floors', metricType, 'floors');
    case 'HeartRate':
      return mapSamples(metricRecord, sample => {
        const value = getNumber(sample.beatsPerMinute);
        return value === null
          ? []
          : mapSampleMetric(sample, metricType, value, 'bpm');
      });
    case 'HeartRateVariabilityRmssd':
      return mapNumericField(
        metricRecord,
        'heartRateVariabilityMillis',
        metricType,
        'ms',
      );
    case 'Height':
      return mapUnitValueField(
        metricRecord,
        'height',
        metricType,
        'inMeters',
        'm',
      );
    case 'Hydration':
      return mapUnitValueField(
        metricRecord,
        'volume',
        metricType,
        'inLiters',
        'L',
      );
    case 'MenstruationFlow':
      return mapNumericField(metricRecord, 'flow', metricType, 'code');
    case 'Nutrition':
      return mapNutrition(metricRecord);
    case 'Power':
      return mapSamples(metricRecord, sample => {
        const power = getUnitValue(sample.power, 'inWatts', 'W');
        return power === null
          ? []
          : mapSampleMetric(sample, metricType, power.value, power.unit);
      });
    case 'RespiratoryRate':
      return mapNumericField(metricRecord, 'rate', metricType, 'breaths/min');
    case 'RestingHeartRate':
      return mapNumericField(metricRecord, 'beatsPerMinute', metricType, 'bpm');
    case 'SkinTemperature': {
      const baseline = mapUnitValueField(
        metricRecord,
        'baseline',
        'Skin Temperature Baseline',
        'inCelsius',
        'celsius',
      );
      const deltas = Array.isArray(metricRecord.deltas)
        ? metricRecord.deltas.flatMap(delta => {
            if (!isRecord(delta) || typeof delta.time !== 'string') {
              return [];
            }

            const unitValue = getUnitValue(delta.delta, 'inCelsius', 'celsius');
            return unitValue === null
              ? []
              : mapSampleMetric(
                  delta,
                  'Skin Temperature Delta',
                  unitValue.value,
                  unitValue.unit,
                );
          })
        : [];

      return [...baseline, ...deltas];
    }
    case 'Speed':
      return mapSamples(metricRecord, sample => {
        const speed = getUnitValue(sample.speed, 'inMetersPerSecond', 'm/s');
        return speed === null
          ? []
          : mapSampleMetric(sample, metricType, speed.value, speed.unit);
      });
    case 'Steps':
    case 'WheelchairPushes':
      return mapNumericField(metricRecord, 'count', metricType, 'count');
    case 'StepsCadence':
      return mapSamples(metricRecord, sample => {
        const value = getNumber(sample.rate);
        return value === null
          ? []
          : mapSampleMetric(sample, metricType, value, 'steps/min');
      });
    case 'TotalCaloriesBurned':
      return mapUnitValueField(
        metricRecord,
        'energy',
        metricType,
        'inKilocalories',
        'kcal',
      );
    case 'Vo2Max':
      return mapNumericField(
        metricRecord,
        'vo2MillilitersPerMinuteKilogram',
        metricType,
        'mL/min/kg',
      );
    case 'Weight':
      return mapUnitValueField(
        metricRecord,
        'weight',
        metricType,
        'inKilograms',
        'kg',
      );
    default:
      return [];
  }
};

export const healthConnectMetricMapper = {
  map<TMetric extends RecordType>(
    metricType: TMetric,
    result: ReadRecordsResult<TMetric>,
  ): HealthConnectMetricMapperResult[] {
    return result.records.flatMap(record => mapRecord(metricType, record));
  },

  mapRecord,
};
