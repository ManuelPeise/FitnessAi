import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExerciseTypeEnum } from "../../../lib/enums/exerciseTypeEnum";
import type { WorkoutIntensityEnum } from "../../../lib/enums/workoutIntensityEnum";
import { trainingDataApi } from "../trainingDataApi";
import type {
  EditableTrainingDataField,
  TrainingDataListItem,
  TrainingDataPrediction,
  TrainingDataUpdateRequest,
} from "../trainingData.types";

const defaultPageSize = 25;

type EditablePatch = Partial<Pick<TrainingDataListItem, EditableTrainingDataField>>;
type DraftsByItemId = Record<number, EditablePatch>;
type PredictedIntensitiesByItemId = Record<number, WorkoutIntensityEnum>;

export function useTrainingData() {
  const [exerciseType, setExerciseType] = useState<ExerciseTypeEnum | null>(null);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [items, setItems] = useState<TrainingDataListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [drafts, setDrafts] = useState<DraftsByItemId>({});
  const [predictedIntensities, setPredictedIntensities] = useState<PredictedIntensitiesByItemId>({});
  const [availableExerciseTypes, setAvailableExerciseTypes] = useState<ExerciseTypeEnum[]>([]);

  useEffect(() => {
    let isActive = true;

    const fetchTrainingData = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const result = await trainingDataApi.getTrainingData({
          exerciseType,
          from,
          to,
          page: page + 1,
          pageSize,
        });

        if (isActive) {
          setItems(result.items);
          setTotalCount(result.totalCount);
          setAvailableExerciseTypes(result.availableExerciseTypes);
          setDrafts({});
          setPredictedIntensities({});
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchTrainingData();

    return () => {
      isActive = false;
    };
  }, [exerciseType, from, to, page, pageSize]);

  const displayedItems = useMemo(
    () => items.map((item) => applyPendingState(item, drafts[item.id], predictedIntensities[item.id])),
    [items, drafts, predictedIntensities],
  );
  const hasPendingChanges = Object.keys(drafts).length > 0 || Object.keys(predictedIntensities).length > 0;

  const handleExerciseTypeChange = useCallback((value: ExerciseTypeEnum | null): void => {
    setExerciseType(value);
    setPage(0);
  }, []);

  const handleDateRangeChange = useCallback((nextFrom: string | null, nextTo: string | null): void => {
    setFrom(nextFrom);
    setTo(nextTo);
    setPage(0);
  }, []);

  const updateItem = useCallback((id: number, patch: EditablePatch): void => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }, []);

  const revertChanges = useCallback((): void => {
    setDrafts({});
    setPredictedIntensities({});
  }, []);

  const deleteItem = useCallback(async (id: number): Promise<void> => {
    setIsDeleting(true);

    try {
      await trainingDataApi.deleteTrainingData(id);

      setItems((current) => current.filter((item) => item.id !== id));
      setTotalCount((current) => Math.max(0, current - 1));
      setDrafts((current) => removeKeys(current, new Set([id])));
      setPredictedIntensities((current) =>
        Object.fromEntries(Object.entries(current).filter(([itemId]) => Number(itemId) !== id)),
      );
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const predictWorkoutIntensity = useCallback(async (): Promise<void> => {
    setIsPredicting(true);

    try {
      const predictions = await trainingDataApi.predictWorkoutIntensity({ exerciseType, from, to });

      setPredictedIntensities((current) => {
        const next = { ...current };

        for (const prediction of predictions) {
          if (!drafts[prediction.id]) {
            next[prediction.id] = prediction.workoutIntensity;
          }
        }

        return next;
      });
    } finally {
      setIsPredicting(false);
    }
  }, [exerciseType, from, to, drafts]);

  const saveChanges = useCallback(async (): Promise<void> => {
    const dirtyIds = Object.keys(drafts).map(Number);
    const predictionIds = Object.keys(predictedIntensities)
      .map(Number)
      .filter((id) => !drafts[id]);

    if (dirtyIds.length === 0 && predictionIds.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const [succeededDraftIds] = await Promise.all([
        dirtyIds.length > 0 ? saveDirtyItems(dirtyIds, displayedItems) : Promise.resolve(new Set<number>()),
        predictionIds.length > 0
          ? trainingDataApi.applyWorkoutIntensityPredictions(
              predictionIds.map((id): TrainingDataPrediction => ({ id, workoutIntensity: predictedIntensities[id] })),
            )
          : Promise.resolve(),
      ]);

      const savedPredictionIds = new Set(predictionIds);

      setItems((current) =>
        current.map((item) => {
          const savedDraft = succeededDraftIds.has(item.id) ? drafts[item.id] : undefined;
          const savedPrediction = savedPredictionIds.has(item.id) ? predictedIntensities[item.id] : undefined;

          return applyPendingState(item, savedDraft, savedPrediction);
        }),
      );
      setDrafts((current) => removeKeys(current, succeededDraftIds));
      setPredictedIntensities({});
    } finally {
      setIsSaving(false);
    }
  }, [drafts, predictedIntensities, displayedItems]);

  return {
    items: displayedItems,
    totalCount,
    isLoading,
    isSaving,
    isPredicting,
    isDeleting,
    hasPendingChanges,
    availableExerciseTypes,
    exerciseType,
    from,
    to,
    page,
    pageSize,
    setExerciseType: handleExerciseTypeChange,
    setDateRange: handleDateRangeChange,
    setPage,
    setPageSize,
    updateItem,
    saveChanges,
    revertChanges,
    predictWorkoutIntensity,
    deleteItem,
  };
}

function applyPendingState(
  item: TrainingDataListItem,
  draftPatch: EditablePatch | undefined,
  predictedIntensity: WorkoutIntensityEnum | undefined,
): TrainingDataListItem {
  if (draftPatch) {
    return { ...item, ...draftPatch };
  }

  if (predictedIntensity !== undefined) {
    return { ...item, workoutIntensity: predictedIntensity };
  }

  return item;
}

async function saveDirtyItems(dirtyIds: number[], displayedItems: TrainingDataListItem[]): Promise<Set<number>> {
  const results = await Promise.allSettled(
    dirtyIds.map(async (id) => {
      const item = displayedItems.find((current) => current.id === id);

      if (item) {
        await trainingDataApi.updateTrainingData(toUpdateRequest(item));
      }

      return id;
    }),
  );

  return new Set(
    results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
  );
}

function removeKeys(drafts: DraftsByItemId, ids: Set<number>): DraftsByItemId {
  return Object.fromEntries(Object.entries(drafts).filter(([id]) => !ids.has(Number(id))));
}

function toUpdateRequest(item: TrainingDataListItem): TrainingDataUpdateRequest {
  return {
    id: item.id,
    durationSeconds: item.durationSeconds,
    distanceInMeters: item.distanceInMeters,
    elevationAvg: item.elevationAvg,
    steps: item.steps,
    stepCadenceAvg: item.stepCadenceAvg,
    speedAvg: item.speedAvg,
    cyclingPedalingCadenceAvg: item.cyclingPedalingCadenceAvg,
    heartRateMin: item.heartRateMin,
    heartRateMax: item.heartRateMax,
    heartRateAvg: item.heartRateAvg,
    powerAvg: item.powerAvg,
    oxygenSaturationPercentage: item.oxygenSaturationPercentage,
    activeCaloriesBurnedInKcal: item.activeCaloriesBurnedInKcal,
    vo2MaxMlPerMinKgAvg: item.vo2MaxMlPerMinKgAvg,
    workoutIntensity: item.workoutIntensity,
  };
}
