import { IntervallTypeEnum } from "../../lib/enums/intervallTypeEnum";
import type { TimeZoneInfo } from "../../shared/types/timeZoneInfo";

export type HealthConnectScheduleSettings = {
  scheduleId: string | null;
  name: string;
  deviceId?: string;
  intervallType?: IntervallTypeEnum;
  timeZoneInfo?: TimeZoneInfo;
  dayOfTheWeek?: number;
  hour?: number;
  minute?: number;
  pastDaysToImport: number;
  initialLoadPastDaysToImport: number;
  isActive: boolean;
  isInitialLoad: boolean;
  originMappings: HealthConnectOriginMapping[];
};

export type HealthConnectOriginMapping = {
  isActive: boolean;
  source: string;
  target: string | null;
};

export type HealthConnectScheduleData = {
  scheduleSettings: HealthConnectScheduleSettings[];
  selectedScheduleSettings: HealthConnectScheduleSettings | null;
};

export type HealthConnectDeleteScheduleRequest = {
  scheduleId: string;
};
