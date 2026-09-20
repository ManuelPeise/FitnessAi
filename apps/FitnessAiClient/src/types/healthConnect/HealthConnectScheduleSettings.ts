import { IntervalTypeEnum } from '../enums/IntervalTypeEnum';

export type HealthConnectScheduleSettings = {
  scheduleId: string;
  name: string;
  deviceId?: string;
  intervallType?: IntervalTypeEnum;
  dayOfTheWeek?: number;
  hour?: number;
  minute?: number;
  pastDaysToImport: number;
  initialLoadPastDaysToImport: number;
  isActive: boolean;
  isInitialLoad: boolean;
  isConnected: boolean;
  lastModificationAt?: Date;
  lastModificationBy?: string;
};
