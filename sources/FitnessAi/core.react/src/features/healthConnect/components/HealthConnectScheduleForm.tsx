import React from "react";
import FormBadge from "src/shared/components/badges/FormBadge";
import type { HealthConnectScheduleSettings } from "../healthConnect.types";
import FormContainer, {
  type FormContainerButtonProps,
} from "src/app/layout/form/FormContainer";
import { useI18n } from "src/lib/i18n/useI18n";

import GeneralHealthConnectSettingsSection from "./GeneralHealthConnectSettingsSection";
import HealthConnectScheduleTimingSection from "./HealthConnectScheduleTimingSection";
import HealthConnectOriginMappingsSection from "./HealthConnectOriginMappingsSection";
import useFormModel from "src/shared/hooks/form/useFormModel";

type HealthConnectScheduleFormProps = {
  scheduleSettings: HealthConnectScheduleSettings | null;
  isLoading: boolean;
  handleSaveSchedule: (model: HealthConnectScheduleSettings) => Promise<void>;
  handleDeleteSchedule: (scheduleId: string) => Promise<void>;
};

const HealthConnectScheduleForm: React.FC<HealthConnectScheduleFormProps> = ({
  scheduleSettings,
  isLoading,
  handleSaveSchedule,
  handleDeleteSchedule,
}) => {
  const { getResource } = useI18n();

  const scheduleFormModel = useFormModel<HealthConnectScheduleSettings>(
    scheduleSettings ?? null,
  );

  const saveButtonProps: FormContainerButtonProps[] = React.useMemo(
    () => [
      {
        type: "Cancel",
        label: getResource("common.labelCancel"),
        disabled: !scheduleFormModel.isModified || isLoading,
        onClick: scheduleFormModel.resetForm,
      },
      {
        type: "Submit",
        label: getResource("common.labelSave"),
        disabled:
          !scheduleFormModel.isModified ||
          !scheduleFormModel.validationResult.isValid ||
          isLoading,
        onClick: () =>
          handleSaveSchedule(
            scheduleFormModel.model as HealthConnectScheduleSettings,
          ),
      },
    ],
    [isLoading, getResource, scheduleFormModel, handleSaveSchedule],
  );

  const additionalButtonProps: FormContainerButtonProps[] = React.useMemo(
    () => [
      {
        type: "Additional",
        label: getResource("common.labelDeleteSchedule"),
        disabled: isLoading || !scheduleFormModel.model?.scheduleId,
        onClick: () =>
          handleDeleteSchedule(scheduleFormModel.model?.scheduleId ?? ""),
      },
    ],
    [isLoading, getResource, scheduleFormModel],
  );
  const isActivationDisabled = React.useMemo(() => {
    return (
      !scheduleFormModel?.model?.deviceId || !scheduleFormModel?.model?.name
    );
  }, [scheduleFormModel.model]);

  const validationErrors = React.useMemo((): string[] => {
    return scheduleFormModel.validationResult?.errors ?? [];
  }, [scheduleFormModel.validationResult?.errors]);

  return (
    <FormContainer
      buttonProps={saveButtonProps}
      additionalButtonProps={additionalButtonProps}
      isModified={scheduleFormModel.isModified}
      isInAction={isLoading}
    >
      <GeneralHealthConnectSettingsSection
        form={scheduleFormModel}
        isActivationDisabled={isActivationDisabled}
      />
      <HealthConnectScheduleTimingSection
        form={scheduleFormModel}
        isExpandDisabled={isActivationDisabled}
      />
      <HealthConnectOriginMappingsSection
        form={scheduleFormModel}
        isExpandDisabled={isActivationDisabled}
      />
      <FormBadge errors={validationErrors} />
    </FormContainer>
  );
};

export default HealthConnectScheduleForm;
