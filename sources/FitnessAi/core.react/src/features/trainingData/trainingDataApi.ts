import { apiClient } from "../../lib/api";
import type {
  TrainingDataFilter,
  TrainingDataPrediction,
  TrainingDataQueryResult,
  TrainingDataUpdateRequest,
} from "./trainingData.types";

const controllerPath = "TrainingData";

export const trainingDataApi = {
  getTrainingData: (filter: TrainingDataFilter): Promise<TrainingDataQueryResult> =>
    apiClient.get<TrainingDataQueryResult>(`${controllerPath}/GetTrainingData`, {
      params: {
        exerciseType: filter.exerciseType ?? undefined,
        from: filter.from ?? undefined,
        to: filter.to ?? undefined,
        page: filter.page,
        pageSize: filter.pageSize,
      },
    }),

  updateTrainingData: (request: TrainingDataUpdateRequest): Promise<void> =>
    apiClient.put<void, TrainingDataUpdateRequest>(`${controllerPath}/UpdateTrainingData`, request),

  deleteTrainingData: (id: number): Promise<void> =>
    apiClient.delete<void>(`${controllerPath}/DeleteTrainingData`, { params: { id } }),

  predictWorkoutIntensity: (
    filter: Pick<TrainingDataFilter, "exerciseType" | "from" | "to">,
  ): Promise<TrainingDataPrediction[]> =>
    apiClient.get<TrainingDataPrediction[]>(`${controllerPath}/PredictWorkoutIntensity`, {
      params: {
        exerciseType: filter.exerciseType ?? undefined,
        from: filter.from ?? undefined,
        to: filter.to ?? undefined,
      },
    }),

  applyWorkoutIntensityPredictions: (predictions: TrainingDataPrediction[]): Promise<void> =>
    apiClient.put<void, TrainingDataPrediction[]>(`${controllerPath}/ApplyWorkoutIntensityPredictions`, predictions),
};
