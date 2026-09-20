import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import LoadingIndicatorOverlay from "../components/overlays/LoadingIndicatorOverlay";
import ScheduleSwitchRow from "../components/ScheduleSwitchRow";
import { apiClient } from "../lib/api/axiosClient";
import { scheduleTableAccessor } from "../lib/database/scheduleTableAccessor";
import useAuthentication from "../hooks/useAuthentication";
import { useI18n } from "../hooks/useI18n";
import { useTheme } from "../hooks/useTheme";
import { HealthConnectScheduleSettings } from "../types/healthConnect/HealthConnectScheduleSettings";
import { SchedulerBaseModel } from "../types/scheduler/SchedulerBaseModel";
import { ScheduleTypeEnum } from "../types/enums/ScheduleTypeEnum";
import { IntervalTypeEnum } from "../types/enums/IntervalTypeEnum";

const fetchHealthConnectScheduleSettings = async (
  deviceId: string,
): Promise<HealthConnectScheduleSettings | null> => {
  const response = await apiClient.post<HealthConnectScheduleSettings>(
    "HealthConnectConfiguration/GetClientScheduleSettings",
    { deviceId },
  );
  return response.data ?? null;
};

const loadSchedules = async (
  userId: number,
): Promise<{
  databaseService: SchedulerBaseModel | null;
  dataExport: HealthConnectScheduleSettings | null;
}> => {
  const [databaseServiceRow, dataExportRow] = await Promise.all([
    scheduleTableAccessor.getScheduleByUserIdAndType(
      userId,
      ScheduleTypeEnum.HealthConnectDatabaseService,
    ),
    scheduleTableAccessor.getScheduleByUserIdAndType(
      userId,
      ScheduleTypeEnum.HealthConnectDataExport,
    ),
  ]);

  return {
    databaseService: databaseServiceRow
      ? (JSON.parse(databaseServiceRow.payloadJson) as SchedulerBaseModel)
      : null,
    dataExport: dataExportRow
      ? (JSON.parse(dataExportRow.payloadJson) as HealthConnectScheduleSettings)
      : null,
  };
};

const saveHealthConnectSchedules = async (
  userId: number,
  scheduleSettings: HealthConnectScheduleSettings,
): Promise<{
  databaseService: SchedulerBaseModel;
  dataExport: HealthConnectScheduleSettings;
}> => {
  const databaseServiceSchedule: SchedulerBaseModel = {
    userId,
    isActive: true,
    type: ScheduleTypeEnum.HealthConnectDatabaseService,
    interval: IntervalTypeEnum.Hourly,
  };

  await scheduleTableAccessor.saveSchedule({
    userId,
    type: ScheduleTypeEnum.HealthConnectDatabaseService,
    payloadJson: JSON.stringify(databaseServiceSchedule),
  });

  await scheduleTableAccessor.saveSchedule({
    userId,
    type: ScheduleTypeEnum.HealthConnectDataExport,
    payloadJson: JSON.stringify(scheduleSettings),
  });

  return {
    databaseService: databaseServiceSchedule,
    dataExport: scheduleSettings,
  };
};

const InitializationScreen: React.FC = () => {
  const { userId } = useAuthentication();
  const { getResource } = useI18n();
  const { theme } = useTheme();
  const [isInitializing, setIsInitializing] = useState(true);
  const [databaseService, setDatabaseService] =
    useState<SchedulerBaseModel | null>(null);
  const [dataExport, setDataExport] =
    useState<HealthConnectScheduleSettings | null>(null);

  const initialize = useCallback(async () => {
    setIsInitializing(true);
    try {
      const deviceId = DeviceInfo.getModel();
      const scheduleSettings = await fetchHealthConnectScheduleSettings(
        deviceId,
      );

      if (scheduleSettings) {
        const saved = await saveHealthConnectSchedules(
          userId,
          scheduleSettings,
        );
        setDatabaseService(saved.databaseService);
        setDataExport(saved.dataExport);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSchedules(userId).then(({ databaseService: db, dataExport: exp }) => {
      if (db && exp) {
        setDatabaseService(db);
        setDataExport(exp);
        setIsInitializing(false);
      } else {
        initialize();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toggleDatabaseService = useCallback(
    async (isActive: boolean) => {
      if (!databaseService) {
        return;
      }
      const updatedDatabaseService = { ...databaseService, isActive };
      await scheduleTableAccessor.saveSchedule({
        userId,
        type: ScheduleTypeEnum.HealthConnectDatabaseService,
        payloadJson: JSON.stringify(updatedDatabaseService),
      });
      setDatabaseService(updatedDatabaseService);

      if (!isActive && dataExport?.isActive) {
        const updatedDataExport = { ...dataExport, isActive: false };
        await scheduleTableAccessor.saveSchedule({
          userId,
          type: ScheduleTypeEnum.HealthConnectDataExport,
          payloadJson: JSON.stringify(updatedDataExport),
        });
        setDataExport(updatedDataExport);
      }
    },
    [userId, databaseService, dataExport],
  );

  const toggleDataExport = useCallback(
    async (isActive: boolean) => {
      if (!dataExport || !databaseService?.isActive) {
        return;
      }
      const updatedDataExport = { ...dataExport, isActive };
      await scheduleTableAccessor.saveSchedule({
        userId,
        type: ScheduleTypeEnum.HealthConnectDataExport,
        payloadJson: JSON.stringify(updatedDataExport),
      });
      setDataExport(updatedDataExport);
    },
    [userId, dataExport, databaseService],
  );

  const hasSchedules = databaseService != null && dataExport != null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.palette.background.default },
      ]}
    >
      {hasSchedules && (
        <View
          style={[
            styles.healthConnectScheduleContainer,
            {
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.healthConnectScheduleTitle,
              { color: theme.palette.text.primary },
            ]}
          >
            {getResource("common", "healthConnectScheduleSettings")}
          </Text>
          <View style={styles.scheduleRows}>
            <ScheduleSwitchRow
              label={getResource(
                "common",
                "healthConnectDatabaseServiceSchedule",
              )}
              isActive={databaseService.isActive}
              onToggle={toggleDatabaseService}
            />
            <ScheduleSwitchRow
              label={getResource("common", "healthConnectDataExportSchedule")}
              isActive={dataExport.isActive}
              onToggle={toggleDataExport}
              disabled={!databaseService.isActive}
            />
          </View>
        </View>
      )}

      {isInitializing && <LoadingIndicatorOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 16,
  },
  healthConnectScheduleContainer: { padding: 16, gap: 12 },
  healthConnectScheduleTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  scheduleRows: { gap: 24 },
});

export default InitializationScreen;
