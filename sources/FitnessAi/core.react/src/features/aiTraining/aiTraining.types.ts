import type { AiModelTypeEnum } from "../../lib/enums/aiModelTypeEnum";

export type AiModelDefinition = {
  aiType: AiModelTypeEnum;
  labelKey: string;
};

export type AiModelQualityMetrics = {
  microAccuracy: number;
  macroAccuracy: number;
  logLoss: number;
};

export type TrainedAiModelMetrics = {
  version: string;
  microAccuracy: number;
  macroAccuracy: number;
  logLoss: number;
  trainedAt: string;
};
