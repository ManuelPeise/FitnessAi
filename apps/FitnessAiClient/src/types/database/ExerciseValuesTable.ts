import { TableBase } from './TabelBase';
import { HealthConnectValueTypeEnum } from '../enums/HealthConnectValueTypeEnum';
import { HealthConnectUnitTypeEnum } from '../enums/HealthConnectUnitTypeEnum';

export type ExerciseValuesTable = TableBase & {
  exerciseId: number;
  valueType: HealthConnectValueTypeEnum;
  value: number;
  unit: HealthConnectUnitTypeEnum;
};
