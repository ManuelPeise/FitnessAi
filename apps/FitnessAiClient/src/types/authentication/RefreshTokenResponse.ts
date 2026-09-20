import { HealthConnectScheduleSettings } from '../healthConnect/HealthConnectScheduleSettings';

export type TokenResponse = {
  token: string;
  refreshToken: string;
  tokenExpiresAt: string;
  scheduleSettings: HealthConnectScheduleSettings;
};
