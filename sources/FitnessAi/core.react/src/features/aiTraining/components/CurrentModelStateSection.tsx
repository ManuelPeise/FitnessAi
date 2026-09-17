import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useI18n } from "../../../lib/i18n/useI18n";
import type { TrainedAiModelMetrics } from "../aiTraining.types";
import { ModelQualityMetricsList } from "./ModelQualityMetricsList";

type CurrentModelStateSectionProps = {
  metrics: TrainedAiModelMetrics | null;
  isLoading: boolean;
};

const untrainedVersion = "0.0.0";

export function CurrentModelStateSection({ metrics, isLoading }: CurrentModelStateSectionProps) {
  const { getResource } = useI18n();

  return (
    <Stack sx={{ gap: 1 }}>
      <Typography variant="h6">{getResource("common.sectionCurrentModel")}</Typography>

      {isLoading && <CircularProgress size={24} />}

      {!isLoading && (metrics === null || metrics.version === untrainedVersion) && (
        <Typography color="text.secondary">
          {getResource("common.noTrainedModel")}
        </Typography>
      )}

      {!isLoading && metrics !== null && metrics.version !== untrainedVersion && (
        <Stack sx={{ gap: 0.5 }}>
          <Typography>
            {getResource("common.version")}: {metrics.version}
          </Typography>
          <ModelQualityMetricsList
            microAccuracy={metrics.microAccuracy}
            macroAccuracy={metrics.macroAccuracy}
            logLoss={metrics.logLoss}
          />
          <Typography>
            {getResource("common.trainedAt", {
              TimeStamp: new Date(metrics.trainedAt).toLocaleString(undefined, {
                timeZone: "UTC",
                dateStyle: "medium",
                timeStyle: "short",
              }),
            })}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
