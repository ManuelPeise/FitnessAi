import type { HealthConnectScheduleSettings } from "../healthConnect.types";
import { IntervallTypeEnum } from "../../../lib/enums/intervallTypeEnum";

export const getDefaultSchedule = (
  count: number,
  getResource?: (key: string) => string,
): HealthConnectScheduleSettings => {
  return {
    scheduleId: `schedule-${count}`,
    name: getResource
      ? getResource("common.labelDefaultSchedule").replace(
          "{count}",
          (count + 1).toString(),
        )
      : `Default Schedule (${count + 1})`,
    deviceId: "",
    intervallType: IntervallTypeEnum.Hourly,
    timeZoneInfo: undefined,
    dayOfTheWeek: undefined,
    hour: undefined,
    minute: undefined,
    pastDaysToImport: 5,
    initialLoadPastDaysToImport: 365,
    isActive: false,
    isInitialLoad: true,
    originMappings: [],
  };
};
