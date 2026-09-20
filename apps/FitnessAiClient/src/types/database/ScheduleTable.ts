import { IntervalTypeEnum } from '../enums/IntervalTypeEnum';
import { ScheduleTypeEnum } from '../enums/ScheduleTypeEnum';
import type { TableBase } from './TabelBase';

export type ScheduleTable = TableBase & {
  userId: number;
  type: ScheduleTypeEnum;
  intervalType: IntervalTypeEnum;
  day: number | null;
  hour: number | null;
  minute: number | null;
  isActive: boolean;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
};
