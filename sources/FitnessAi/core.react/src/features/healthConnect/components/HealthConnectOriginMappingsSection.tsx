import { Box, List } from "@mui/material";
import { useI18n } from "src/lib/i18n/useI18n";
import CollapsibleFormSection from "src/app/layout/form/CollapsibleFormSection";
import { AppTextField } from "src/shared/components/AppTextField";
import AppCheckbox from "src/shared/components/AppCheckbox";
import FormFieldRow from "../../../app/layout/form/FormFieldRow";
import type { UseFormModelResult } from "src/shared/hooks/form/useFormModel";
import type {
  HealthConnectOriginMapping,
  HealthConnectScheduleSettings,
} from "../healthConnect.types";
import { useCallback } from "react";

type HealthConnectOriginMappingsSectionProps = {
  form: UseFormModelResult<HealthConnectScheduleSettings>;
  isExpandDisabled: boolean;
};

const HealthConnectOriginMappingsSection: React.FC<
  HealthConnectOriginMappingsSectionProps
> = (props) => {
  const { form, isExpandDisabled } = props;
  const { getResource } = useI18n();

  const handleOriginMappingChange = useCallback(
    (mappingIndex: number, updatedMapping: HealthConnectOriginMapping) => {
      const mappings: HealthConnectOriginMapping[] =
        form.model?.originMappings ?? [];

      form.handleChange(
        "originMappings",
        mappings.map((m, i) => (i === mappingIndex ? updatedMapping : m)),
      );
    },
    [form],
  );

  return (
    <CollapsibleFormSection
      title={getResource("common.captionHealthConnectOriginMappings")}
      subtitle={getResource("common.labelHealthConnectOriginMappings")}
      startCollapsed={true}
      disabled={isExpandDisabled}
    >
      <List>
        {form.model?.originMappings?.map((mapping, mappingIndex) => (
          <Box key={mappingIndex}>
            <FormFieldRow>
              <AppCheckbox
                label={getResource("common.labelIsActive")}
                checked={mapping.isActive}
                onChange={(event) =>
                  handleOriginMappingChange(mappingIndex, {
                    ...mapping,
                    isActive: event.target.checked,
                  })
                }
              />
              <AppTextField
                label={getResource("common.labelSource")}
                value={mapping.source}
                onChange={(event) =>
                  handleOriginMappingChange(mappingIndex, {
                    ...mapping,
                    source: event.target.value,
                  })
                }
                fullWidth
              />
              <AppTextField
                label={getResource("common.labelTarget")}
                value={mapping.target ?? ""}
                onChange={(event) =>
                  handleOriginMappingChange(mappingIndex, {
                    ...mapping,
                    target: event.target.value,
                  })
                }
                fullWidth
              />
            </FormFieldRow>
          </Box>
        ))}
      </List>
    </CollapsibleFormSection>
  );
};

export default HealthConnectOriginMappingsSection;
