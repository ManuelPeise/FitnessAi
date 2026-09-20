import { ScheduleTypeEnum } from "../enums/ScheduleTypeEnum";
import type { TableBase } from "./TabelBase";

export type ScheduleTable = TableBase & {
  userId: number;
  type: ScheduleTypeEnum;
  payloadJson: string;
};
