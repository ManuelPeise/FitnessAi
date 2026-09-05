import {
  ScheduleSettingsTableEntry,
  ScheduleSettingsType,
} from '../../database/databaseTypes';
import { databaseAccessor } from '../../database/database';
import { apiClient } from '../api/axiosClient';
import { utils } from '../../utils';
import { healthConnectSchedulePayloadFactory } from './healthConnectSchedulePayloadFactory';

const scheduleSyncServiceUrl = 'HealthConnectImport/ImportTrainingData';

class HealthConnectScheduleService {
  async executeDueSchedules() {
    await this.execute('HealthConnectExerciseDataExport');
    await this.execute('HealthConnectHealthDataExport');
  }
  async execute(type: ScheduleSettingsType, initialLoadDays?: number) {
    const currentTimeStamp = new Date();
    const startTimeStamp =
      initialLoadDays != null
        ? utils.getStartOfDay(
            utils.getPreviousDate(currentTimeStamp, initialLoadDays),
          )
        : utils.getStartOfDay(currentTimeStamp);

    switch (type) {
      case 'HealthConnectExerciseDataExport':
        await this.processHealthConnectHealthDataExport(
          type,
          startTimeStamp,
          currentTimeStamp,
        );
        break;
      case 'HealthConnectHealthDataExport':
        await this.processHealthConnectHealthDataExport(
          type,
          startTimeStamp,
          currentTimeStamp,
        );
        break;
      default:
        console.warn(`Unhandled schedule type: ${type}`);
        break;
    }
  }

  private async processHealthConnectHealthDataExport(
    type: ScheduleSettingsType,
    from: Date,
    to: Date,
  ) {
    const exportModel = await healthConnectSchedulePayloadFactory.create({
      from: from,
      to: to,
      type: type,
    });

    try {
      if (exportModel.schedule == null) {
        throw new Error('Schedule could not be created or is null');
      }

      if (!exportModel.schedule?.isActive) {
        return;
      }

      if (exportModel.payload?.length === 0) {
        throw new Error('Could not create payload or payload is empty');
      }

      const response = await apiClient.post(
        scheduleSyncServiceUrl,
        exportModel.payload,
      );

      if (response.status === 200) {
        await this.updateSchedule(exportModel.schedule, to, true);

        return;
      }
    } catch (error) {
      if (exportModel.schedule) {
        await this.updateSchedule(
          exportModel.schedule,
          to,
          false,
          String(error),
        );
      }
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

export default HealthConnectScheduleService;
