import Stack from "@mui/material/Stack";
import { useI18n } from "../../../lib/i18n/useI18n";
import type { ExerciseTypeEnum } from "../../../lib/enums/exerciseTypeEnum";
import { AppButton } from "../../../shared/components/AppButton";
import { ExerciseTypeSelector } from "./ExerciseTypeSelector";
import { TrainingDataDateRangeFilter } from "./TrainingDataDateRangeFilter";

type TrainingDataFiltersProps = {
  exerciseType: ExerciseTypeEnum | null;
  availableExerciseTypes: ExerciseTypeEnum[];
  from: string | null;
  to: string | null;
  onExerciseTypeChange: (value: ExerciseTypeEnum | null) => void;
  onDateRangeChange: (from: string | null, to: string | null) => void;
  hasPendingChanges: boolean;
  isSaving: boolean;
  isPredicting: boolean;
  onSave: () => void;
  onRevert: () => void;
  onPredictWorkoutIntensity: () => void;
};

export function TrainingDataFilters({
  exerciseType,
  availableExerciseTypes,
  from,
  to,
  onExerciseTypeChange,
  onDateRangeChange,
  hasPendingChanges,
  isSaving,
  isPredicting,
  onSave,
  onRevert,
  onPredictWorkoutIntensity,
}: TrainingDataFiltersProps) {
  const { getResource } = useI18n();

  return (
    <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", alignItems: "center" }}>
        <ExerciseTypeSelector value={exerciseType} options={availableExerciseTypes} onChange={onExerciseTypeChange} />
        <TrainingDataDateRangeFilter from={from} to={to} onChange={onDateRangeChange} />
      </Stack>

      {hasPendingChanges ? (
        <Stack direction="row" sx={{ gap: 1 }}>
          <AppButton onClick={onRevert} disabled={isSaving}>
            {getResource("common.revertChanges")}
          </AppButton>
          <AppButton onClick={onSave} disabled={isSaving}>
            {getResource("common.saveChanges")}
          </AppButton>
        </Stack>
      ) : (
        <AppButton onClick={onPredictWorkoutIntensity} disabled={isPredicting}>
          {getResource("common.predictWorkoutIntensity")}
        </AppButton>
      )}
    </Stack>
  );
}
