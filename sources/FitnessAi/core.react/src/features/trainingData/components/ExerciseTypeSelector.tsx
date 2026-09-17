import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useI18n } from "../../../lib/i18n/useI18n";
import { exerciseTypeLabels, type ExerciseTypeEnum } from "../../../lib/enums/exerciseTypeEnum";

type ExerciseTypeSelectorProps = {
  value: ExerciseTypeEnum | null;
  options: ExerciseTypeEnum[];
  onChange: (value: ExerciseTypeEnum | null) => void;
};

export function ExerciseTypeSelector({ value, options, onChange }: ExerciseTypeSelectorProps) {
  const { getResource } = useI18n();

  return (
    <Autocomplete
      value={value}
      options={options}
      getOptionLabel={(option) => exerciseTypeLabels[option] ?? String(option)}
      onChange={(_event, nextValue) => onChange(nextValue)}
      sx={{ minWidth: 240 }}
      renderInput={(params) => (
        <TextField {...params} variant="standard" label={getResource("common.labelExerciseType")} />
      )}
    />
  );
}
