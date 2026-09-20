import React from "react";
import HealthConnectScheduleForm from "src/features/healthConnect/components/HealthConnectScheduleForm";
import SettingsPageLayout from "../app/layout/SettingsPageLayout";
import type {
  HealthConnectDeleteScheduleRequest,
  HealthConnectScheduleData,
  HealthConnectScheduleSettings,
} from "../features/healthConnect/healthConnect.types";
import HealthConnectConnectionSelection from "src/features/healthConnect/components/HealthConnectConnectionSelection";
import { useApi, type UseApiResult } from "src/shared/hooks/useApi";
import { getDefaultSchedule } from "src/features/healthConnect/helper/formHelper";
import ApiBadge, {
  type ApiBadgeState,
} from "src/shared/components/badges/ApiBadge";
import { useI18n } from "src/lib/i18n/useI18n";

type HealthConnectInitializationProps = {
  scheduleSettingsApi: UseApiResult<HealthConnectScheduleSettings[]>;
};

const HealthConnectContainer: React.FC = () => {
  const scheduleSettingsApi = useApi<HealthConnectScheduleSettings[]>({
    endpoint: "/healthconnectconfiguration/getschedulesettings",
    method: "GET",
  });

  if (scheduleSettingsApi.isLoading) {
    return <div>Loading...</div>;
  }

  return <HealthConnectPage scheduleSettingsApi={scheduleSettingsApi} />;
};

const HealthConnectPage: React.FC<HealthConnectInitializationProps> = (
  props,
) => {
  const { scheduleSettingsApi } = props;
  const { getResource } = useI18n();
  const [status, setStatus] = React.useState<ApiBadgeState>({
    show: false,
    status: "unknown",
    message: null,
  });

  const [scheduleData, setScheduleData] =
    React.useState<HealthConnectScheduleData>({
      scheduleSettings: scheduleSettingsApi.response ?? [],
      selectedScheduleSettings: scheduleSettingsApi.response?.[0] ?? null,
    });

  const handleAddNewSchedule = React.useCallback(() => {
    const newSchedule = getDefaultSchedule(
      scheduleData.scheduleSettings.length,
      getResource,
    );

    setScheduleData({
      scheduleSettings: [...scheduleData.scheduleSettings, newSchedule],
      selectedScheduleSettings: newSchedule,
    });
  }, [scheduleData]);

  const handleSelectConnection = React.useCallback(
    (setting: HealthConnectScheduleSettings) => {
      const selectedSchedule =
        scheduleData.scheduleSettings.find(
          (s) => s.deviceId === setting.deviceId,
        ) ?? null;

      console.log("Selected schedule:", selectedSchedule);
      if (!selectedSchedule) return;

      setScheduleData((prev) => ({
        ...prev,
        selectedScheduleSettings: selectedSchedule,
      }));
    },
    [scheduleData],
  );

  const handleSaveSchedule = React.useCallback(
    async (model: HealthConnectScheduleSettings) => {
      if (!model) return;

      const response =
        await scheduleSettingsApi.post<HealthConnectScheduleSettings>(
          "/healthconnectconfiguration/updateschedulesettings",
          model,
        );

      if (response) {
        const scheduleId = scheduleData.selectedScheduleSettings?.deviceId;

        setScheduleData({
          ...scheduleData,
          scheduleSettings: scheduleData.scheduleSettings ?? [],
          selectedScheduleSettings:
            scheduleData.scheduleSettings.find(
              (s) => s.deviceId === scheduleId,
            ) ?? null,
        });

        setStatus({
          show: true,
          status: "success",
          message: getResource("common.messageSaveSuccess"),
        });

        return;
      }

      setStatus({
        show: true,
        status: "error",
        message: getResource("common.messageSaveFailed"),
      });
    },
    [scheduleData],
  );

  const handleDeleteSchedule = React.useCallback(
    async (scheduleId: string) => {
      if (!scheduleId) return;

      const request: HealthConnectDeleteScheduleRequest = {
        scheduleId,
      };

      const response = await scheduleSettingsApi.post(
        "/healthconnectconfiguration/deleteschedule",
        request,
      );

      if (response) {
        setScheduleData({
          scheduleSettings: response ?? [],
          selectedScheduleSettings: null,
        });
      }
    },
    [scheduleData],
  );

  return (
    <SettingsPageLayout
      titleResourceKey="common.captionHealthConnectScheduledImportSettings"
      subtitleResourceKey="common.labelHealthConnectScheduledImportSettings"
      listContent={
        <HealthConnectConnectionSelection
          schedules={scheduleData.scheduleSettings}
          selectedScheduleSettings={scheduleData.selectedScheduleSettings}
          handleAddNewSchedule={handleAddNewSchedule}
          handleSelectConnection={handleSelectConnection}
        />
      }
    >
      <HealthConnectScheduleForm
        scheduleSettings={scheduleData.selectedScheduleSettings}
        handleSaveSchedule={handleSaveSchedule}
        handleDeleteSchedule={handleDeleteSchedule}
        isLoading={scheduleSettingsApi.isLoading}
      />

      <ApiBadge
        status={status.status}
        message={status.message}
        show={status.show}
      />
    </SettingsPageLayout>
  );
};

export default HealthConnectContainer;
