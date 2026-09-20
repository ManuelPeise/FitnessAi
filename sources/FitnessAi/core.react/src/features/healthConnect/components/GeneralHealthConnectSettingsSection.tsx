import { List } from "@mui/material";
import { useI18n } from "src/lib/i18n/useI18n";
import CollapsibleFormSection from "src/app/layout/form/CollapsibleFormSection";
import { AppTextField } from "src/shared/components/AppTextField";
import ListItemSwitch from "src/shared/components/listItemFields/ListItemSwitch";
import FormFieldRow from "../../../app/layout/form/FormFieldRow";
import type { HealthConnectScheduleSettings } from "../healthConnect.types";
import type { UseFormModelResult } from "src/shared/hooks/form/useFormModel";

type GeneralHealthConnectSettingsSectionProps = {
  form: UseFormModelResult<HealthConnectScheduleSettings>;
  isActivationDisabled: boolean;
};

const GeneralHealthConnectSettingsSection: React.FC<
  GeneralHealthConnectSettingsSectionProps
> = (props) => {
  const { form } = props;
  const { getResource } = useI18n();

  return (
    <CollapsibleFormSection
      title={getResource("common.captionGeneralHealthConnectSettings")}
      subtitle={getResource("common.labelGeneralHealthConnectSettings")}
      startCollapsed={true}
    >
      <List>
        <FormFieldRow>
          <AppTextField
            label={getResource("common.labelDeviceId")}
            placeholder={getResource("common.placeholderDeviceId")}
            value={form.model?.deviceId ?? ""}
            onChange={(event) =>
              form.handleChange("deviceId", event.target.value)
            }
            fullWidth
          />
          <AppTextField
            label={getResource("common.labelDeviceName")}
            placeholder={getResource("common.placeholderDeviceName")}
            value={form.model?.name ?? ""}
            onChange={(event) => form.handleChange("name", event.target.value)}
            fullWidth
          />
        </FormFieldRow>
        <ListItemSwitch
          caption={getResource("common.labelIsActive")}
          description={getResource("common.descriptionIsActive")}
          checked={Boolean(form.model?.isActive ?? false)}
          onChange={(event) =>
            form.handleChange("isActive", event.target.checked)
          }
          disabled={props.isActivationDisabled}
        />
      </List>
    </CollapsibleFormSection>
  );
};

export default GeneralHealthConnectSettingsSection;
