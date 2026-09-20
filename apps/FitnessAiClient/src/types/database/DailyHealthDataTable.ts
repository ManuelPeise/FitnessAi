import { HealthConnectRecordTypeEnum } from '../enums/HealthConnectRecordTypeEnum';
import type { TableBase } from './TabelBase';

export type DailyHealthDataTable = TableBase & {
  userId: number;
  recordId: string;
  recordType: HealthConnectRecordTypeEnum;
  date: string;
  value: number;
  dataOrigin?: string;
  startTime: string;
  endTime: string;
};
