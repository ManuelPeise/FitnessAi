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
    const currentTimeStamp = new Date();
    const startTimeStamp =
      initialLoadDays != null
        ? utils.getStartOfDay(
            utils.getPreviousDate(currentTimeStamp, initialLoadDays),
          )
        : utils.getStartOfDay(currentTimeStamp);

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
      currentTimeStamp,
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
      if (exportModel.schedule == null) {
        throw new Error(
          getResource('healthConnect.descriptionNoScheduleForCurrentUser'),
        );
      }

      if (!exportModel.schedule?.isActive) {
        return { success: true, pushedItems: 0 };
      }

      if (exportModel.payload?.length === 0) {
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
        exportModel.payload,
      );

      if (response.status === 200) {
        await this.updateSchedule(exportModel.schedule, to, true);

        return {
          success: true,
          pushedItems: exportModel.payload.length,
        };
      }

      throw new Error(
        `${getResource('healthConnect.descriptionScheduleSyncFailedPrefix')} ${
          response.status
        }.`,
      );
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
