import { IntervallTypeEnum } from "src/lib/enums/intervallTypeEnum";

type GetResource = (key: string) => string;
type Option<TValue> = { label: string; value: TValue };

export const HOUR_OPTIONS: Option<number>[] = Array.from(
  { length: 24 },
  (_, hour) => ({ label: hour.toString().padStart(2, "0"), value: hour }),
);

export const MINUTE_OPTIONS: Option<number>[] = [0, 15, 30, 45].map(
  (minute) => ({ label: minute.toString().padStart(2, "0"), value: minute }),
);

export const getIntervallTypeOptions = (
  getResource: GetResource,
): Option<IntervallTypeEnum>[] => [
  {
    label: getResource("common.labelIntervalHourly"),
    value: IntervallTypeEnum.Hourly,
  },
  {
    label: getResource("common.labelIntervalDaily"),
    value: IntervallTypeEnum.Daily,
  },
  {
    label: getResource("common.labelIntervalWeekly"),
    value: IntervallTypeEnum.Weekly,
  },
];

// Matches the backend's System.DayOfWeek numbering (Sunday = 0 ... Saturday = 6).
export const getDayOfTheWeekOptions = (
  getResource: GetResource,
): Option<number>[] => [
  { label: getResource("common.labelSunday"), value: 0 },
  { label: getResource("common.labelMonday"), value: 1 },
  { label: getResource("common.labelTuesday"), value: 2 },
  { label: getResource("common.labelWednesday"), value: 3 },
  { label: getResource("common.labelThursday"), value: 4 },
  { label: getResource("common.labelFriday"), value: 5 },
  { label: getResource("common.labelSaturday"), value: 6 },
];
