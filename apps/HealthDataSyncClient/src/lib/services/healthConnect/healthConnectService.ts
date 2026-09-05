import {
  getSdkStatus as getHealthConnectSdkStatus,
  SdkAvailabilityStatus,
  initialize as initializeHealthConnect,
  requestPermission as requestHealthConnectPermission,
  getGrantedPermissions as getHealthConnectGrantedPermissions,
  readRecords as readHealthConnectRecords,
  aggregateRecord as aggregateHealthConnectRecord,
  type Permission,
  type RecordType,
  type ReadRecordsOptions,
  type ReadRecordsResult,
  AggregateResult,
} from 'react-native-health-connect';
import {
  HealthConnectPermission,
  HealthConnectReadRange,
} from './healthConnectTypes';
import { getResource } from '../../localization';

export type HealthConnectTrainingAggregateRecordType =
  | 'ActiveCaloriesBurned'
  | 'CyclingPedalingCadence'
  | 'Distance'
  | 'ElevationGained'
  | 'ExerciseSession'
  | 'FloorsClimbed'
  | 'HeartRate'
  | 'Power'
  | 'Speed'
  | 'Steps'
  | 'StepsCadence'
  | 'TotalCaloriesBurned';

class HealthConnectService {
  private initialized = false;

  private requiredHealthConnectPermissions: Permission[] = [
    {
      accessType: 'read',
      recordType: 'ActiveCaloriesBurned',
    },
    {
      accessType: 'read',
      recordType: 'BasalBodyTemperature',
    },
    {
      accessType: 'read',
      recordType: 'BasalMetabolicRate',
    },
    {
      accessType: 'read',
      recordType: 'BloodGlucose',
    },
    {
      accessType: 'read',
      recordType: 'BloodPressure',
    },
    {
      accessType: 'read',
      recordType: 'BodyFat',
    },
    {
      accessType: 'read',
      recordType: 'BodyTemperature',
    },
    {
      accessType: 'read',
      recordType: 'BodyWaterMass',
    },
    {
      accessType: 'read',
      recordType: 'BoneMass',
    },
    {
      accessType: 'read',
      recordType: 'CervicalMucus',
    },
    {
      accessType: 'read',
      recordType: 'CyclingPedalingCadence',
    },
    {
      accessType: 'read',
      recordType: 'Distance',
    },
    {
      accessType: 'read',
      recordType: 'ElevationGained',
    },
    {
      accessType: 'read',
      recordType: 'ExerciseSession',
    },
    {
      accessType: 'read',
      recordType: 'FloorsClimbed',
    },
    {
      accessType: 'read',
      recordType: 'HeartRate',
    },
    {
      accessType: 'read',
      recordType: 'HeartRateVariabilityRmssd',
    },
    {
      accessType: 'read',
      recordType: 'Height',
    },
    {
      accessType: 'read',
      recordType: 'Hydration',
    },
    {
      accessType: 'read',
      recordType: 'IntermenstrualBleeding',
    },
    {
      accessType: 'read',
      recordType: 'LeanBodyMass',
    },
    {
      accessType: 'read',
      recordType: 'MenstruationFlow',
    },
    {
      accessType: 'read',
      recordType: 'MenstruationPeriod',
    },
    {
      accessType: 'read',
      recordType: 'Nutrition',
    },
    {
      accessType: 'read',
      recordType: 'OvulationTest',
    },
    {
      accessType: 'read',
      recordType: 'OxygenSaturation',
    },
    {
      accessType: 'read',
      recordType: 'Power',
    },
    {
      accessType: 'read',
      recordType: 'RespiratoryRate',
    },
    {
      accessType: 'read',
      recordType: 'RestingHeartRate',
    },
    {
      accessType: 'read',
      recordType: 'SexualActivity',
    },
    {
      accessType: 'read',
      recordType: 'SkinTemperature',
    },
    {
      accessType: 'read',
      recordType: 'SleepSession',
    },
    {
      accessType: 'read',
      recordType: 'Speed',
    },
    {
      accessType: 'read',
      recordType: 'Steps',
    },
    {
      accessType: 'read',
      recordType: 'StepsCadence',
    },
    {
      accessType: 'read',
      recordType: 'TotalCaloriesBurned',
    },
    {
      accessType: 'read',
      recordType: 'Vo2Max',
    },
    {
      accessType: 'read',
      recordType: 'Weight',
    },
    {
      accessType: 'read',
      recordType: 'WheelchairPushes',
    },
  ];

  async getSdkStatus(): Promise<number> {
    return getHealthConnectSdkStatus();
  }

  async isSdkAvailable(): Promise<boolean> {
    const sdkStatus = await this.getSdkStatus();

    return sdkStatus === SdkAvailabilityStatus.SDK_AVAILABLE;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    const sdkAvailable = await this.isSdkAvailable();

    if (!sdkAvailable) {
      return false;
    }

    this.initialized = await initializeHealthConnect();
    return this.initialized;
  }

  async requestPermissions(): Promise<HealthConnectPermission[]> {
    await this.ensureInitialized();

    return requestHealthConnectPermission(
      this.requiredHealthConnectPermissions,
    );
  }

  async getGrantedPermissions(): Promise<HealthConnectPermission[]> {
    await this.ensureInitialized();

    return getHealthConnectGrantedPermissions();
  }

  async hasRequiredPermissions(): Promise<boolean> {
    const grantedPermissions = await this.getGrantedPermissions();

    return this.areAllRequiredPermissionsGranted(grantedPermissions);
  }

  async ensurePermissions(): Promise<boolean> {
    await this.ensureInitialized();

    const grantedPermissions = await this.getGrantedPermissions();

    if (this.areAllRequiredPermissionsGranted(grantedPermissions)) {
      return true;
    }

    const requestedPermissions = await this.requestPermissions();

    return this.areAllRequiredPermissionsGranted(requestedPermissions);
  }

  async readExerciseSessions(
    range: HealthConnectReadRange,
  ): Promise<ReadRecordsResult<'ExerciseSession'>> {
    await this.ensureInitialized();

    return readHealthConnectRecords(
      'ExerciseSession',
      this.createReadOptions(range),
    );
  }

  async readMetric<T extends RecordType>(
    metricType: T,
    range: HealthConnectReadRange,
  ): Promise<ReadRecordsResult<T>> {
    await this.ensureInitialized();

    return readHealthConnectRecords(metricType, this.createReadOptions(range));
  }

  async readLastMetric<T extends RecordType>(
    metricType: T,
  ): Promise<ReadRecordsResult<T>> {
    await this.ensureInitialized();

    return readHealthConnectRecords(metricType, {
      timeRangeFilter: {
        operator: 'between',
        startTime: new Date(0).toISOString(),
        endTime: new Date().toISOString(),
      },
      ascendingOrder: false,
      pageSize: 1,
    });
  }

  async readAggregatedMetric<
    T extends HealthConnectTrainingAggregateRecordType,
  >(metricType: T, range: HealthConnectReadRange): Promise<AggregateResult<T>> {
    const result = await aggregateHealthConnectRecord({
      recordType: metricType,
      timeRangeFilter: this.createReadOptions(range).timeRangeFilter,
    });

    return result;
  }

  async getAvailableOrigins(range?: HealthConnectReadRange): Promise<string[]> {
    await this.ensureInitialized();

    const readRange: HealthConnectReadRange = range ?? {
      startTime: new Date(0),
      endTime: new Date(),
    };

    const results = await Promise.all(
      this.requiredHealthConnectPermissions.map(async permission => {
        try {
          return await this.readMetric(permission.recordType, readRange);
        } catch {
          // A metric without granted permission must not block the others.
          return null;
        }
      }),
    );

    const origins = new Set<string>();

    results.forEach(result => {
      result?.records.forEach(record => {
        const dataOrigin = (record as { metadata?: { dataOrigin?: string } })
          .metadata?.dataOrigin;

        if (dataOrigin && !origins.has(dataOrigin)) {
          origins.add(dataOrigin);
        }
      });
    });

    return Array.from(origins).sort();
  }

  private areAllRequiredPermissionsGranted(
    grantedPermissions: HealthConnectPermission[],
  ): boolean {
    return this.requiredHealthConnectPermissions.every(requiredPermission =>
      grantedPermissions.some(
        grantedPermission =>
          grantedPermission.accessType === requiredPermission.accessType &&
          grantedPermission.recordType === requiredPermission.recordType,
      ),
    );
  }

  private async ensureInitialized(): Promise<void> {
    const initialized = await this.initialize();

    if (!initialized) {
      throw new Error(
        getResource('common.descriptionHealthConnectInitializeFailed'),
      );
    }
  }

  private createReadOptions(range: HealthConnectReadRange): ReadRecordsOptions {
    return {
      timeRangeFilter: {
        operator: 'between',
        startTime: this.toIsoString(range.startTime),
        endTime: this.toIsoString(range.endTime),
      },
      dataOriginFilter: range.dataOriginFilter,
      ascendingOrder: range.ascendingOrder,
      pageSize: range.pageSize,
      pageToken: range.pageToken,
    };
  }

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : value;
  }
}

export const healthConnectService = new HealthConnectService();
