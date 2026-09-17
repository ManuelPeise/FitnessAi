import { apiClient } from "../../lib/api";
import type { AiModelTypeEnum } from "../../lib/enums/aiModelTypeEnum";
import type { AiModelQualityMetrics, TrainedAiModelMetrics } from "./aiTraining.types";

const trainingControllerPath = "AiModelTraining";
const csvControllerPath = "AiTrainingWorkOutIntensityCsv";

export const aiTrainingApi = {
  trainModel: (aiType: AiModelTypeEnum): Promise<void> =>
    apiClient.post<void>(`${trainingControllerPath}/TrainAiModel`, undefined, {
      params: { aiType },
    }),

  getModelQuality: (aiType: AiModelTypeEnum): Promise<AiModelQualityMetrics> =>
    apiClient.get<AiModelQualityMetrics>(`${trainingControllerPath}/GetAiModelQuality`, {
      params: { aiType },
    }),

  getLatestModelQuality: (aiType: AiModelTypeEnum): Promise<TrainedAiModelMetrics> =>
    apiClient.get<TrainedAiModelMetrics>(
      `${trainingControllerPath}/GetLatestAiModelQuality`,
      { params: { aiType } },
    ),

  downloadInitialTrainingCsv: (itemsCount: number): Promise<Blob> =>
    apiClient.get<Blob>(
      `${csvControllerPath}/LoadInitialWorkOutIntensityTrainingCsv`,
      { params: { itemsCount }, responseType: "blob" },
    ),

  downloadExistingTrainingCsv: async (): Promise<Blob | null> => {
    try {
      return await apiClient.get<Blob>(`${csvControllerPath}/GetExistingWorkOutIntensityCsv`, {
        responseType: "blob",
      });
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 404) {
        return null;
      }

      throw error;
    }
  },

  uploadTrainingCsv: (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<void, FormData>(
      `${csvControllerPath}/UpdateWorkOutIntensityTrainingCsvData`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
