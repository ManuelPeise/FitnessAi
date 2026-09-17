import { useState } from "react";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppButton } from "../../../shared/components/AppButton";
import { useI18n } from "../../../lib/i18n/useI18n";
import type { AiModelTypeEnum } from "../../../lib/enums/aiModelTypeEnum";
import { useModelTrainingActions } from "../hooks/useModelTrainingActions";
import { ModelQualityMetricsList } from "./ModelQualityMetricsList";

type ModelTrainingSectionProps = {
  aiType: AiModelTypeEnum;
  onTrained: () => void;
};

export function ModelTrainingSection({ aiType, onTrained }: ModelTrainingSectionProps) {
  const { getResource } = useI18n();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const {
    testResult,
    isTesting,
    isTraining,
    hasError,
    runTestTraining,
    trainAndSave,
    clearTestResult,
  } = useModelTrainingActions(aiType, onTrained);

  const handleConfirmTrain = async (): Promise<void> => {
    setIsConfirmOpen(false);
    await trainAndSave();
  };

  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="h6">{getResource("common.sectionTraining")}</Typography>

      <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
        <AppButton disabled={isTesting} onClick={() => void runTestTraining()}>
          {getResource("common.runTestTraining")}
        </AppButton>
        <AppButton color="warning" disabled={isTraining} onClick={() => setIsConfirmOpen(true)}>
          {getResource("common.trainAndSave")}
        </AppButton>
      </Stack>

      {hasError && <Alert severity="error">{getResource("common.requestFailed")}</Alert>}

      <Dialog open={testResult !== null} onClose={clearTestResult}>
        <DialogTitle>{getResource("common.testResultTitle")}</DialogTitle>
        <DialogContent>
          {testResult && (
            <ModelQualityMetricsList
              microAccuracy={testResult.microAccuracy}
              macroAccuracy={testResult.macroAccuracy}
              logLoss={testResult.logLoss}
            />
          )}
        </DialogContent>
        <DialogActions>
          <AppButton onClick={clearTestResult}>{getResource("common.close")}</AppButton>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>{getResource("common.trainConfirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getResource("common.trainConfirmMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <AppButton variant="outlined" onClick={() => setIsConfirmOpen(false)}>
            {getResource("common.cancel")}
          </AppButton>
          <AppButton color="warning" onClick={() => void handleConfirmTrain()}>
            {getResource("common.confirm")}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
