import { IntervalTypeEnum } from "../enums/IntervalTypeEnum";

export type SchedulerBaseModel = {
  userId: number;
  type: string;
  isActive: boolean;
  interval: IntervalTypeEnum;
  dayOfTheWeek?: number;
  hour?: number;
  minute?: number;
};
