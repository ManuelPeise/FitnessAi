import {
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { databaseAccessor } from '../../database/database';
import { apiClient } from '../api/axiosClient';
import { utils } from '../../utils';
import { healthConnectSchedulePayloadFactory } from './healthConnectSchedulePayloadFactory';
import {
  secureStorage,
  SecureStorageKeys,
  UserInfo,
} from '../storage/secureStorage';
import { getResource } from '../../localization';
import { isAxiosError } from 'axios';

const scheduleSyncServiceUrl = 'HealthConnectImport/ImportHealthData';

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
    const endTimeStamp = new Date();
    endTimeStamp.setHours(23, 59, 59, 999);

    const startTimeStamp =
      initialLoadDays != null
        ? utils.getStartOfDay(
            utils.getPreviousDate(endTimeStamp, initialLoadDays),
          )
        : utils.getStartOfDay(endTimeStamp);

    if (type !== 'HealthConnectHealthDataExport') {
      return {
        success: false,
        pushedItems: 0,
        message: `${getResource(
          'healthConnect.descriptionUnhandledScheduleTypePrefix',
        )}: ${type}`,
      };
    }

    return await this.processHealthConnectHealthDataExport(
      userId,
      type,
      startTimeStamp,
      endTimeStamp,
    );
  }

  private async getCurrentUserId(): Promise<number> {
    const serializedUserInfo = await secureStorage.getItem(
      SecureStorageKeys.USER_INFO,
    );
    let userInfo: UserInfo | null = null;

    if (!serializedUserInfo) {
      throw new Error(
        getResource(
          'healthConnect.descriptionCannotExecuteScheduleWithoutUser',
        ),
      );
    }

    try {
      userInfo = JSON.parse(serializedUserInfo) as UserInfo;
    } catch {
      userInfo = null;
    }

    if (
      userInfo == null ||
      !userInfo.isAuthenticated ||
      userInfo.userId == null ||
      !Number.isInteger(userInfo.userId) ||
      userInfo.userId <= 0
    ) {
      throw new Error(
        getResource(
          'healthConnect.descriptionCannotExecuteScheduleWithoutUser',
        ),
      );
    }

    return userInfo.userId;
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
      if (exportModel.scheduler?.schedule == null) {
        throw new Error(
          getResource('healthConnect.descriptionNoScheduleForCurrentUser'),
        );
      }

      const schedule = exportModel.scheduler.schedule;

      if (!schedule.isActive) {
        return { success: true, pushedItems: 0 };
      }

      if (exportModel == null) {
        return {
          success: true,
          pushedItems: 0,
          message: getResource(
            'healthConnect.descriptionNoMappedDataForExport',
          ),
        };
      }

      const response = await apiClient.post(
        scheduleSyncServiceUrl,
        exportModel.dailyDataModels,
      );

      if (response.status !== 200) {
        throw new Error(
          `${getResource(
            'healthConnect.descriptionScheduleSyncFailedPrefix',
          )} ${response.status}.`,
        );
      }

      await this.updateSchedule(schedule, to, true);
      return {
        success: true,
        pushedItems: exportModel.dailyDataModels.length,
      };
    } catch (error) {
      const errorMessage = this.getScheduleSyncErrorMessage(error);

      if (exportModel.scheduler?.schedule) {
        await this.updateSchedule(
          exportModel.scheduler?.schedule,
          to,
          false,
          errorMessage,
        );
      }

      return {
        success: false,
        pushedItems: 0,
        message: errorMessage,
      };
    }
  }

  private getScheduleSyncErrorMessage(error: unknown) {
    const failurePrefix = getResource(
      'healthConnect.descriptionScheduleSyncFailedPrefix',
    );

    if (isAxiosError(error)) {
      const responseStatus = error.response?.status;

      if (responseStatus != null) {
        return `${failurePrefix} ${responseStatus}.`;
      }

      return `${failurePrefix}: ${error.message}`;
    }

    return error instanceof Error ? error.message : String(error);
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
