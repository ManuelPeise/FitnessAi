import { useCallback, useEffect, useState } from "react";
import type { AiModelTypeEnum } from "../../../lib/enums/aiModelTypeEnum";
import { aiTrainingApi } from "../aiTrainingApi";
import type { TrainedAiModelMetrics } from "../aiTraining.types";

export function useCurrentModelState(aiType: AiModelTypeEnum) {
  const [metrics, setMetrics] = useState<TrainedAiModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchMetrics = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const result = await aiTrainingApi.getLatestModelQuality(aiType);

        if (isActive) {
          setMetrics(result);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchMetrics();

    return () => {
      isActive = false;
    };
  }, [aiType, reloadToken]);

  const reload = useCallback((): void => setReloadToken((token) => token + 1), []);

  return { metrics, isLoading, reload };
}
