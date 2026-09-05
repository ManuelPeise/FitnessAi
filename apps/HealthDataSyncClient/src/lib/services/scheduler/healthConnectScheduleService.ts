import {
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { databaseAccessor } from '../../database/database';
import { apiClient } from '../api/axiosClient';
import { utils } from '../../utils';
import { healthConnectSchedulePayloadFactory } from './healthConnectSchedulePayloadFactory';
import { secureStorage, SecureStorageKeys } from '../storage/secureStorage';

const scheduleSyncServiceUrl = 'HealthConnectImport/ImportTrainingData';

type ExecuteManuallyOptions = {
  initialLoadDays?: number;
};

type ScheduleExecutionResult = {
  success: boolean;
  pushedItems: number;
  message?: string;
};

class HealthConnectScheduleService {
  async executeDueSchedules() {
    await this.execute('HealthConnectExerciseDataExport');
    await this.execute('HealthConnectHealthDataExport');
  }

  async execute(type: ScheduleSettingsType, initialLoadDays?: number) {
    await this.executeInternal(type, initialLoadDays);
  }

  async executeManually(
    type: ScheduleSettingsType,
    options?: ExecuteManuallyOptions,
  ): Promise<ScheduleExecutionResult> {
    return await this.executeInternal(type, options?.initialLoadDays);
  }

  private async executeInternal(
    type: ScheduleSettingsType,
    initialLoadDays?: number,
  ): Promise<ScheduleExecutionResult> {
    const userId = await this.getCurrentUserId();
    const currentTimeStamp = new Date();
    const startTimeStamp =
      initialLoadDays != null
        ? utils.getStartOfDay(
            utils.getPreviousDate(currentTimeStamp, initialLoadDays),
          )
        : utils.getStartOfDay(currentTimeStamp);

    switch (type) {
      case 'HealthConnectExerciseDataExport':
        return await this.processHealthConnectHealthDataExport(
          userId,
          type,
          startTimeStamp,
          currentTimeStamp,
        );
      case 'HealthConnectHealthDataExport':
        return await this.processHealthConnectHealthDataExport(
          userId,
          type,
          startTimeStamp,
          currentTimeStamp,
        );
      default:
        return {
          success: false,
          pushedItems: 0,
          message: `Unhandled schedule type: ${type}`,
        };
    }
  }

  private async getCurrentUserId(): Promise<number> {
    const storedUserId = await secureStorage.getItem(
      SecureStorageKeys.CURRENT_USER_ID,
    );
    const parsedUserId = Number(storedUserId);

    if (!storedUserId || !Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      throw new Error('Cannot execute schedule without authenticated user.');
    }

    return parsedUserId;
  }

  private async processHealthConnectHealthDataExport(
    userId: number,
    type: ScheduleSettingsType,
    from: Date,
    to: Date,
  ): Promise<ScheduleExecutionResult> {
    const exportModel = await healthConnectSchedulePayloadFactory.create(
      userId,
      {
        from: from,
        to: to,
        type: type,
      },
    );

    try {
      if (exportModel.schedule == null) {
        throw new Error('No schedule was found for the current user.');
      }

      if (!exportModel.schedule?.isActive) {
        return { success: true, pushedItems: 0 };
      }

      if (exportModel.payload?.length === 0) {
        return {
          success: true,
          pushedItems: 0,
          message: 'No mapped data available for export.',
        };
      }

      const response = await apiClient.post(
        scheduleSyncServiceUrl,
        exportModel.payload,
      );

      if (response.status === 200) {
        await this.updateSchedule(exportModel.schedule, to, true);

        return {
          success: true,
          pushedItems: exportModel.payload.length,
        };
      }

      throw new Error(`Schedule sync failed with status ${response.status}.`);
    } catch (error) {
      if (exportModel.schedule) {
        await this.updateSchedule(
          exportModel.schedule,
          to,
          false,
          String(error),
        );
      }

      return {
        success: false,
        pushedItems: 0,
        message: String(error),
      };
    }
  }

  private async updateSchedule(
    schedule: ScheduleSettingsTableEntry,
    currentTimeStamp: Date,
    success: boolean,
    errorMessage?: string,
  ) {
    const updatedSchedule: ScheduleSettingsTableEntry = {
      ...schedule,
      lastExecutedAt: success
        ? utils.dateToString(currentTimeStamp)
        : schedule.lastExecutedAt,
      lastExecutionError: !success && errorMessage ? errorMessage : null,
      lastExecutionStatus: success ? 'success' : 'failed',
    };

    await databaseAccessor.schedule.saveSchedule(updatedSchedule);
  }
}

export const healthConnectScheduleExecutionService =
  new HealthConnectScheduleService();

export default HealthConnectScheduleService;
