import { useState } from "react";
import type { AiModelTypeEnum } from "../../../lib/enums/aiModelTypeEnum";
import { aiTrainingApi } from "../aiTrainingApi";
import type { AiModelQualityMetrics } from "../aiTraining.types";

export function useModelTrainingActions(aiType: AiModelTypeEnum, onTrained: () => void) {
  const [testResult, setTestResult] = useState<AiModelQualityMetrics | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [hasError, setHasError] = useState(false);

  const runTestTraining = async (): Promise<void> => {
    setIsTesting(true);
    setHasError(false);

    try {
      setTestResult(await aiTrainingApi.getModelQuality(aiType));
    } catch {
      setHasError(true);
    } finally {
      setIsTesting(false);
    }
  };

  const trainAndSave = async (): Promise<void> => {
    setIsTraining(true);
    setHasError(false);

    try {
      await aiTrainingApi.trainModel(aiType);
      onTrained();
    } catch {
      setHasError(true);
    } finally {
      setIsTraining(false);
    }
  };

  const clearTestResult = (): void => setTestResult(null);

  return {
    testResult,
    isTesting,
    isTraining,
    hasError,
    runTestTraining,
    trainAndSave,
    clearTestResult,
  };
}
