import { List } from "@mui/material";
import { useI18n } from "src/lib/i18n/useI18n";
import { IntervallTypeEnum } from "src/lib/enums/intervallTypeEnum";
import CollapsibleFormSection from "src/app/layout/form/CollapsibleFormSection";
import Dropdown from "src/shared/components/Dropdown";
import AppNumberField from "src/shared/components/AppNumberField";
import ListItemSwitch from "src/shared/components/listItemFields/ListItemSwitch";
import FormFieldRow from "../../../app/layout/form/FormFieldRow";
import {
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  getDayOfTheWeekOptions,
  getIntervallTypeOptions,
} from "../helper/constants";
import type { UseFormModelResult } from "src/shared/hooks/form/useFormModel";
import type { HealthConnectScheduleSettings } from "../healthConnect.types";

type HealthConnectScheduleTimingSectionProps = {
  form: UseFormModelResult<HealthConnectScheduleSettings>;
  isExpandDisabled: boolean;
};

const HealthConnectScheduleTimingSection: React.FC<
  HealthConnectScheduleTimingSectionProps
> = (props) => {
  const { form, isExpandDisabled } = props;
  const { getResource } = useI18n();

  return (
    <CollapsibleFormSection
      title={getResource("common.captionHealthConnectScheduleSettings")}
      subtitle={getResource("common.labelHealthConnectScheduleSettings")}
      startCollapsed={true}
      disabled={isExpandDisabled}
    >
      <List>
        <FormFieldRow>
          <Dropdown
            placeholder={getResource("common.placeholderIntervallType")}
            value={form.model?.intervallType ?? ""}
            onChange={(event) =>
              form.handleChange("intervallType", event.target.value)
            }
            fullWidth
            options={getIntervallTypeOptions(getResource)}
            disabled={isExpandDisabled}
          />
          <Dropdown
            placeholder={getResource("common.labelDayOfTheWeek")}
            value={form.model?.dayOfTheWeek ?? ""}
            onChange={(event) =>
              form.handleChange("dayOfTheWeek", event.target.value)
            }
            fullWidth
            options={getDayOfTheWeekOptions(getResource)}
            disabled={
              isExpandDisabled ||
              form.model?.intervallType !== IntervallTypeEnum.Weekly
            }
          />
        </FormFieldRow>
        <FormFieldRow>
          <Dropdown
            placeholder={getResource("common.labelHour")}
            value={form.model?.hour ?? ""}
            onChange={(event) => form.handleChange("hour", event.target.value)}
            fullWidth
            options={HOUR_OPTIONS}
            disabled={
              isExpandDisabled ||
              form.model?.intervallType === IntervallTypeEnum.Hourly
            }
          />
          <Dropdown
            placeholder={getResource("common.labelMinute")}
            value={form.model?.minute ?? ""}
            onChange={(event) =>
              form.handleChange("minute", event.target.value)
            }
            fullWidth
            options={MINUTE_OPTIONS}
            disabled={
              isExpandDisabled ||
              form.model?.intervallType === IntervallTypeEnum.Hourly
            }
          />
        </FormFieldRow>
        <FormFieldRow>
          <AppNumberField
            label={getResource("common.labelPastDaysToImport")}
            placeholder={getResource("common.labelPastDaysToImport")}
            value={form.model?.pastDaysToImport ?? 0}
            onChange={(event) =>
              form.handleChange("pastDaysToImport", event.target.value)
            }
            fullWidth
            disabled={isExpandDisabled}
          />
          <AppNumberField
            label={getResource("common.labelInitialLoadDays")}
            placeholder={getResource("common.labelInitialLoadDays")}
            value={form.model?.initialLoadPastDaysToImport ?? 0}
            onChange={(event) =>
              form.handleChange(
                "initialLoadPastDaysToImport",
                event.target.value,
              )
            }
            fullWidth
            disabled={isExpandDisabled}
          />
        </FormFieldRow>
        <ListItemSwitch
          caption={getResource("common.labelIsInitialLoad")}
          description={getResource("common.descriptionIsInitialLoad")}
          checked={form.model?.isInitialLoad ?? false}
          onChange={(event) =>
            form.handleChange("isInitialLoad", event.target.checked)
          }
          disabled={isExpandDisabled}
        />
      </List>
    </CollapsibleFormSection>
  );
};

export default HealthConnectScheduleTimingSection;
