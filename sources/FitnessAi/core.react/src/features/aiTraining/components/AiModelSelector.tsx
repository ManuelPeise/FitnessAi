import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { useI18n } from "../../../lib/i18n/useI18n";
import type { AiModelTypeEnum } from "../../../lib/enums/aiModelTypeEnum";
import { aiModelDefinitions } from "../aiModelDefinitions";

type AiModelSelectorProps = {
  value: AiModelTypeEnum;
  onChange: (value: AiModelTypeEnum) => void;
};

export function AiModelSelector({ value, onChange }: AiModelSelectorProps) {
  const { getResource } = useI18n();
  const label = getResource("common.modelSelectLabel");

  const handleChange = (event: SelectChangeEvent<AiModelTypeEnum>): void => {
    onChange(Number(event.target.value) as AiModelTypeEnum);
  };

  return (
    <FormControl sx={{ minWidth: 260 }}>
      <InputLabel id="ai-model-select-label">{label}</InputLabel>
      <Select
        labelId="ai-model-select-label"
        label={label}
        value={value}
        variant="standard"
        onChange={handleChange}
      >
        {aiModelDefinitions.map((model) => (
          <MenuItem key={model.aiType} value={model.aiType}>
            {getResource(model.labelKey)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
