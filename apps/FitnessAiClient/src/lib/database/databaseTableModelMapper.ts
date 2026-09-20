import { QueryResult, Scalar } from "@op-engineering/op-sqlite";
import { UserDataTable } from "../../types/database/UserDataTable";
import { UserAuthenticationTable } from "../../types/database/UserAuthenticationTable";
import { SettingsTable } from "../../types/database/SettingsTable";
import { ScheduleTable } from "../../types/database/ScheduleTable";
import { DailyHealthDataTable } from "../../types/database/DailyHealthDataTable";
import { HealthConnectValueTypeEnum } from "../../types/enums/HealthConnectValueTypeEnum";
import { HealthConnectUnitTypeEnum } from "../../types/enums/HealthConnectUnitTypeEnum";
import { ExerciseTable } from "../../types/database/ExerciseTable";
import { ExerciseValuesTable } from "../../types/database/ExerciseValuesTable";
import { ScheduleTypeEnum } from "../../types/enums/ScheduleTypeEnum";
import { LanguageTypeEnum } from "../../types/enums/LanguageTypeEnum";
import { HealthConnectRecordTypeEnum } from "../../types/enums/HealthConnectRecordTypeEnum";

const databaseTableModelMapper = {
  mapResultToUserDataTableEntries: (
    resultSet: QueryResult,
  ): UserDataTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      firstName: row.firstName as string,
      lastName: row.lastName as string,
      email: row.email as string,
      credentialsId: row.credentialsId as number,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
  mapResultToUserAuthenticationTable: (
    resultSet: QueryResult,
  ): UserAuthenticationTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      userId: row.userId as number,
      jwt: row.jwt as string,
      refreshToken: row.refreshToken as string,
      expiresAt: row.expiresAt as string,
      isCurrent: (row.isCurrent as number) === 1,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
  mapResultToSettingsTable: (resultSet: QueryResult): SettingsTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      userId: row.userId as number,
      lang: row.lang as Scalar as LanguageTypeEnum,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
  mapResultToScheduleTable: (resultSet: QueryResult): ScheduleTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      userId: row.userId as number,
      type: row.type as Scalar as ScheduleTypeEnum,
      payloadJson: row.payloadJson as string,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
  mapResultToDailyHealthDataTable: (
    resultSet: QueryResult,
  ): DailyHealthDataTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      userId: row.userId as number,
      recordId: row.recordId as string,
      recordType: row.recordType as Scalar as HealthConnectRecordTypeEnum,
      date: row.date as string,
      value: row.value as number,
      dataOrigin: row.dataOrigin as string,
      startTime: row.startTime as string,
      endTime: row.endTime as string,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
  mapResultToExerciseTable: (resultSet: QueryResult): ExerciseTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      userId: row.userId as number,
      exerciseId: row.exerciseId as number,
      dataOrigin: row.dataOrigin as string,
      exerciseType: row.exerciseType as string,
      startTime: row.startTime as string,
      endTime: row.endTime as string,
      durationSeconds: row.durationSeconds as number,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
  mapResultToExerciseValuesTable: (
    resultSet: QueryResult,
  ): ExerciseValuesTable[] => {
    return resultSet.rows.map((row) => ({
      id: row.id as number,
      exerciseId: row.exerciseId as number,
      valueType: row.valueType as HealthConnectValueTypeEnum,
      value: row.value as number,
      unit: row.unit as HealthConnectUnitTypeEnum,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    }));
  },
};

export default databaseTableModelMapper;
