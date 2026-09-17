import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useI18n } from "../../../lib/i18n/useI18n";

type ModelQualityMetricsListProps = {
  microAccuracy: number;
  macroAccuracy: number;
  logLoss: number;
};

export function ModelQualityMetricsList({
  microAccuracy,
  macroAccuracy,
  logLoss,
}: ModelQualityMetricsListProps) {
  const { getResource } = useI18n();

  return (
    <Stack sx={{ gap: 0.5 }}>
      <Typography>
        {getResource("common.microAccuracy")}: {microAccuracy.toFixed(3)}
      </Typography>
      <Typography>
        {getResource("common.macroAccuracy")}: {macroAccuracy.toFixed(3)}
      </Typography>
      <Typography>
        {getResource("common.logLoss")}: {logLoss.toFixed(3)}
      </Typography>
    </Stack>
  );
}
