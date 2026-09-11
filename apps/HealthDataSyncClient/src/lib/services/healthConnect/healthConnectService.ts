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
  ReadHealthDataHistoryPermission,
  AggregateRequest,
  AggregateResultRecordType,
} from 'react-native-health-connect';
import {
  HealthConnectPermission,
  HealthConnectReadRange,
} from './healthConnectTypes';
import { getResource } from '../../localization';

// Must stay in sync with the read permissions declared in AndroidManifest.xml.
const REQUIRED_HEALTH_CONNECT_RECORD_TYPES: RecordType[] = [
  'ActiveCaloriesBurned',
  'BasalBodyTemperature',
  'BasalMetabolicRate',
  'BloodGlucose',
  'BloodPressure',
  'BodyFat',
  'BodyTemperature',
  'BodyWaterMass',
  'BoneMass',
  'CervicalMucus',
  'CyclingPedalingCadence',
  'Distance',
  'ElevationGained',
  'ExerciseSession',
  'FloorsClimbed',
  'HeartRate',
  'HeartRateVariabilityRmssd',
  'Height',
  'Hydration',
  'IntermenstrualBleeding',
  'LeanBodyMass',
  'MenstruationFlow',
  'MenstruationPeriod',
  'Nutrition',
  'OvulationTest',
  'OxygenSaturation',
  'Power',
  'RespiratoryRate',
  'RestingHeartRate',
  'SexualActivity',
  'SkinTemperature',
  'SleepSession',
  'Speed',
  'Steps',
  'StepsCadence',
  'TotalCaloriesBurned',
  'Vo2Max',
  'Weight',
  'WheelchairPushes',
];

class HealthConnectService {
  private initialized = false;

  private requiredHealthConnectPermissions: Permission[] =
    REQUIRED_HEALTH_CONNECT_RECORD_TYPES.map(recordType => ({
      accessType: 'read',
      recordType,
    }));

  private historyPermission: ReadHealthDataHistoryPermission[] = [
    {
      accessType: 'read',
      recordType: 'ReadHealthDataHistory',
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

    const permissions = [
      ...this.requiredHealthConnectPermissions,
      ...this.historyPermission,
    ];
    return await requestHealthConnectPermission(permissions);
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
    origins: string[],
  ): Promise<ReadRecordsResult<'ExerciseSession'>> {
    await this.ensureInitialized();

    const result = await readHealthConnectRecords(
      'ExerciseSession',
      this.createReadOptions(range),
    );
    const records = result.records.filter(record =>
      origins.includes(record.metadata?.dataOrigin ?? ''),
    );

    return { ...result, records };
  }

  async readMetric<T extends RecordType>(
    metricType: T,
    range: HealthConnectReadRange,
  ): Promise<ReadRecordsResult<T>> {
    await this.ensureInitialized();

    const records: ReadRecordsResult<T>['records'] = [];

    let pageToken: string | undefined;

    do {
      const result = await readHealthConnectRecords(
        metricType,
        this.createReadOptions({ ...range, pageToken }),
      );

      records.push(...result.records);
      pageToken = result.pageToken;
    } while (pageToken);

    return { records };
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

  async getAggregateResult<TModel extends AggregateResultRecordType>(
    recordType: AggregateRequest<TModel>['recordType'],
    readRange: HealthConnectReadRange,
    origins: string[],
  ): Promise<AggregateResult<TModel>> {
    const result = await aggregateHealthConnectRecord({
      recordType: recordType,
      timeRangeFilter: this.createReadOptions(readRange).timeRangeFilter,
      dataOriginFilter: [...origins],
    });

    return result;
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
