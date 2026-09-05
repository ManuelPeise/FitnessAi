import { ReadRecordsResult, RecordType } from 'react-native-health-connect';
import {
  HealthConnectDataEntry,
  HealthConnectDataUnitEnum,
  HealthConnectRecordTypeEnum,
} from './scheduleTypes';

export const mapMetric = (
  type: RecordType,
  result: ReadRecordsResult<RecordType>,
): HealthConnectDataEntry[] => {
  switch (type) {
    case 'ActiveCaloriesBurned':
      const resultData = result as ReadRecordsResult<'ActiveCaloriesBurned'>;

      return resultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['ActiveCaloriesBurned'],
        unit: HealthConnectDataUnitEnum.KILOCALORIES,
        value: record.energy.inKilocalories,
      }));
    case 'CyclingPedalingCadence':
      const cyclingPedalingCadenceResultData =
        result as ReadRecordsResult<'CyclingPedalingCadence'>;

      const cyclingPedalingCadenceSamples =
        cyclingPedalingCadenceResultData.records.flatMap(
          record => record.samples,
        );
      return cyclingPedalingCadenceSamples.map(sample => ({
        type: HealthConnectRecordTypeEnum['CyclingPedalingCadence'],
        unit: HealthConnectDataUnitEnum.REVOLUTIONS_PER_MINUTE,
        value: sample.revolutionsPerMinute,
      }));
    case 'Distance':
      const distanceResultData = result as ReadRecordsResult<'Distance'>;

      return distanceResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['Distance'],
        unit: HealthConnectDataUnitEnum.METERS,
        value: record.distance.inMeters,
      }));
    case 'ElevationGained':
      const elevationGainedResultData =
        result as ReadRecordsResult<'ElevationGained'>;

      return elevationGainedResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['ElevationGained'],
        unit: HealthConnectDataUnitEnum.METERS,
        value: record.elevation.inMeters,
      }));
    case 'HeartRate':
      const heartRateResultData = result as ReadRecordsResult<'HeartRate'>;

      const heartRateSamples = heartRateResultData.records.flatMap(
        record => record.samples,
      );
      return heartRateSamples.map(sample => ({
        type: HealthConnectRecordTypeEnum['HeartRate'],
        unit: HealthConnectDataUnitEnum.BEATS_PER_MINUTE,
        value: sample.beatsPerMinute,
      }));
    case 'HeartRateVariabilityRmssd':
      const heartRateVariabilityRmssdResultData =
        result as ReadRecordsResult<'HeartRateVariabilityRmssd'>;

      return heartRateVariabilityRmssdResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['HeartRateVariabilityRmssd'],
        unit: HealthConnectDataUnitEnum.MILLIS,
        value: record.heartRateVariabilityMillis,
      }));
    case 'OxygenSaturation':
      const oxygenSaturationResultData =
        result as ReadRecordsResult<'OxygenSaturation'>;

      return oxygenSaturationResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['OxygenSaturation'],
        unit: HealthConnectDataUnitEnum.PERCENTAGE,
        value: record.percentage,
      }));
    case 'Power':
      const powerResultData = result as ReadRecordsResult<'Power'>;

      const powerSamples = powerResultData.records.flatMap(
        record => record.samples,
      );
      return powerSamples.map(sample => ({
        type: HealthConnectRecordTypeEnum['Power'],
        unit: HealthConnectDataUnitEnum.WATTS,
        value: sample.power.inWatts,
      }));
    case 'RespiratoryRate':
      const respiratoryRateResultData =
        result as ReadRecordsResult<'RespiratoryRate'>;

      return respiratoryRateResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['RespiratoryRate'],
        unit: HealthConnectDataUnitEnum.RATE,
        value: record.rate,
      }));
    case 'Speed':
      const speedResultData = result as ReadRecordsResult<'Speed'>;

      const speedSamples = speedResultData.records.flatMap(
        record => record.samples,
      );
      return speedSamples.map(sample => ({
        type: HealthConnectRecordTypeEnum['Speed'],
        unit: HealthConnectDataUnitEnum.KILOMETERS_PER_HOUR,
        value: sample.speed.inKilometersPerHour,
      }));
    case 'Steps':
      const stepsResultData = result as ReadRecordsResult<'Steps'>;

      return stepsResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['Steps'],
        unit: HealthConnectDataUnitEnum.RATE,
        value: record.count,
      }));
    case 'StepsCadence':
      const stepsCadenceResultData =
        result as ReadRecordsResult<'StepsCadence'>;
      const stepsCadenceSamples = stepsCadenceResultData.records.flatMap(
        record => record.samples,
      );
      return stepsCadenceSamples.map(sample => ({
        type: HealthConnectRecordTypeEnum['StepsCadence'],
        unit: HealthConnectDataUnitEnum.RATE,
        value: sample.rate,
      }));
    case 'TotalCaloriesBurned':
      const totalCaloriesBurnedResultData =
        result as ReadRecordsResult<'TotalCaloriesBurned'>;

      return totalCaloriesBurnedResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['TotalCaloriesBurned'],
        unit: HealthConnectDataUnitEnum.KILOCALORIES,
        value: record.energy.inKilocalories,
      }));
    case 'Vo2Max':
      const vo2MaxResultData = result as ReadRecordsResult<'Vo2Max'>;

      return vo2MaxResultData.records.map(record => ({
        type: HealthConnectRecordTypeEnum['Vo2Max'],
        unit: HealthConnectDataUnitEnum.RATE,
        value: record.vo2MillilitersPerMinuteKilogram,
      }));
    default:
      return [];
  }
};
