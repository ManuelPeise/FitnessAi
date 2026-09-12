import {
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { databaseAccessor } from '../../database/database';
import { apiClient } from '../api/axiosClient';
import { utils } from '../../utils';
import { utilsScheduler } from '../../utils.Scheduler';
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

    const { startTimeStamp } = utilsScheduler.getDateRangeForExecution(
      endTimeStamp,
      initialLoadDays,
    );

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

  private static readonly exportChunkSizeDays = 30;

  private async processHealthConnectHealthDataExport(
    userId: number,
    type: ScheduleSettingsType,
    from: Date,
    to: Date,
  ): Promise<ScheduleExecutionResult> {
    const chunks = utilsScheduler.chunkDateRange(
      from,
      to,
      HealthConnectScheduleService.exportChunkSizeDays,
    );

    let scheduleForUpdate: ScheduleSettingsTableEntry | null = null;
    let totalPushedItems = 0;

    try {
      for (const chunk of chunks) {
        const exportModel = await healthConnectSchedulePayloadFactory.create(
          userId,
          { from: chunk.from, to: chunk.to, type },
        );

        if (exportModel.scheduler?.schedule == null) {
          throw new Error(
            getResource('healthConnect.descriptionNoScheduleForCurrentUser'),
          );
        }

        scheduleForUpdate = exportModel.scheduler.schedule;

        if (!scheduleForUpdate.isActive) {
          return { success: true, pushedItems: totalPushedItems };
        }

        if (exportModel.dailyDataModels.length === 0) {
          continue;
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

        totalPushedItems += exportModel.dailyDataModels.length;
      }

      if (scheduleForUpdate) {
        await this.updateSchedule(scheduleForUpdate, to, true);
      }

      if (totalPushedItems === 0) {
        return {
          success: true,
          pushedItems: 0,
          message: getResource(
            'healthConnect.descriptionNoMappedDataForExport',
          ),
        };
      }

      return { success: true, pushedItems: totalPushedItems };
    } catch (error) {
      const errorMessage = this.getScheduleSyncErrorMessage(error);

      if (scheduleForUpdate) {
        await this.updateSchedule(scheduleForUpdate, to, false, errorMessage);
      }

      return {
        success: false,
        pushedItems: totalPushedItems,
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
