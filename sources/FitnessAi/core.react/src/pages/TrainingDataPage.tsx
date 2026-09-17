import Stack from "@mui/material/Stack";
import { PageHeader } from "../shared/components/PageHeader";
import { useI18n } from "../lib/i18n/useI18n";
import { TrainingDataFilters } from "../features/trainingData/components/TrainingDataFilters";
import { TrainingDataTable } from "../features/trainingData/components/TrainingDataTable";
import { useTrainingData } from "../features/trainingData/hooks/useTrainingData";

const TrainingDataPage = () => {
  const { getResource } = useI18n();
  const {
    items,
    totalCount,
    exerciseType,
    availableExerciseTypes,
    from,
    to,
    page,
    pageSize,
    setExerciseType,
    setDateRange,
    setPage,
    setPageSize,
    updateItem,
    hasPendingChanges,
    isSaving,
    isPredicting,
    saveChanges,
    revertChanges,
    predictWorkoutIntensity,
    deleteItem,
  } = useTrainingData();

  return (
    <Stack sx={{ gap: 3 }}>
      <PageHeader title={getResource("common.trainingDataPageTitle")} />

      <TrainingDataFilters
        exerciseType={exerciseType}
        availableExerciseTypes={availableExerciseTypes}
        from={from}
        to={to}
        onExerciseTypeChange={setExerciseType}
        onDateRangeChange={setDateRange}
        hasPendingChanges={hasPendingChanges}
        isSaving={isSaving}
        isPredicting={isPredicting}
        onSave={() => void saveChanges()}
        onRevert={revertChanges}
        onPredictWorkoutIntensity={() => void predictWorkoutIntensity()}
      />

      <TrainingDataTable
        items={items}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onUpdateItem={updateItem}
        onDeleteItem={(id) => void deleteItem(id)}
      />
    </Stack>
  );
};

export default TrainingDataPage;
