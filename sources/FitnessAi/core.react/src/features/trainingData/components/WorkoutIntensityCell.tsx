import { useState } from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { alpha } from "@mui/material/styles";
import { useI18n } from "../../../lib/i18n/useI18n";
import { editableWorkoutIntensities, WorkoutIntensityEnum, workoutIntensityLabelKeys } from "../../../lib/enums/workoutIntensityEnum";

type WorkoutIntensityCellProps = {
  value: WorkoutIntensityEnum | null;
  onCommit: (value: WorkoutIntensityEnum | null) => void;
};

const colorByIntensity: Record<WorkoutIntensityEnum, string> = {
  [WorkoutIntensityEnum.Unknown]: "#aab5af",
  [WorkoutIntensityEnum.Easy]: "#b7ef52",
  [WorkoutIntensityEnum.Medium]: "#f2c94c",
  [WorkoutIntensityEnum.High]: "#ff9d91",
};

// Matches the click-to-edit pattern used by EditableNumberCell/DurationCell: a plain colored
// label at rest, the real editor only while open. "Unknown" is only ever the display state for a
// null value, per spec - it is never one of the selectable classification classes, so it is not
// offered as a MenuItem here.
export function WorkoutIntensityCell({ value, onCommit }: WorkoutIntensityCellProps) {
  const { getResource } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const intensity = value ?? WorkoutIntensityEnum.Unknown;

  const handleChange = (event: SelectChangeEvent<string>): void => {
    setIsEditing(false);
    onCommit(Number(event.target.value) as WorkoutIntensityEnum);
  };

  if (!isEditing) {
    const isUnknown = intensity === WorkoutIntensityEnum.Unknown;

    return (
      <Box
        onClick={() => setIsEditing(true)}
        sx={{
          width: "100%",
          borderRadius: 0,
          backgroundColor: isUnknown ? "transparent" : alpha(colorByIntensity[intensity], 0.16),
          color: colorByIntensity[intensity],
          cursor: "pointer",
          fontWeight: 500,
          fontSize: "0.8125rem",
          textAlign: "center",
          px: 1,
          py: 0.5,
        }}
      >
        {getResource(workoutIntensityLabelKeys[intensity])}
      </Box>
    );
  }

  return (
    <Select
      variant="standard"
      autoFocus
      open
      value={String(intensity)}
      onChange={handleChange}
      onClose={() => setIsEditing(false)}
      sx={{ width: "100%" }}
    >
      {editableWorkoutIntensities.map((option) => (
        <MenuItem key={option} value={option}>
          {getResource(workoutIntensityLabelKeys[option])}
        </MenuItem>
      ))}
    </Select>
  );
}
