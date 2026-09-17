import { useState } from "react";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { PageHeader } from "../shared/components/PageHeader";
import { useAuthenticationState } from "../features/authentication/useAuthenticationState";
import { UserRoleEnum } from "../lib/enums/userRoleEnum";
import { AiModelTypeEnum } from "../lib/enums/aiModelTypeEnum";
import { useI18n } from "../lib/i18n/useI18n";
import { AiModelSelector } from "../features/aiTraining/components/AiModelSelector";
import { TrainingFileHeaderActions } from "../features/aiTraining/components/TrainingFileHeaderActions";
import { ModelTrainingSection } from "../features/aiTraining/components/ModelTrainingSection";
import { CurrentModelStateSection } from "../features/aiTraining/components/CurrentModelStateSection";
import { supportsTrainingFile } from "../features/aiTraining/aiModelDefinitions";
import { useCurrentModelState } from "../features/aiTraining/hooks/useCurrentModelState";

const AiTrainingPage = () => {
  const { getResource } = useI18n();
  const { user } = useAuthenticationState();
  const [selectedAiType, setSelectedAiType] = useState<AiModelTypeEnum>(
    AiModelTypeEnum.WorkoutIntensity,
  );
  const { metrics, isLoading, reload } = useCurrentModelState(selectedAiType);

  if (user?.role !== UserRoleEnum.Admin) {
    return (
      <Alert severity="warning">
        {getResource("common.accessRestricted")}
      </Alert>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <PageHeader title={getResource("common.aiTrainingPageTitle")}>
        {supportsTrainingFile(selectedAiType) && <TrainingFileHeaderActions />}
      </PageHeader>

      <AiModelSelector value={selectedAiType} onChange={setSelectedAiType} />

      <Paper sx={{ padding: 3 }}>
        <CurrentModelStateSection metrics={metrics} isLoading={isLoading} />
      </Paper>

      <Paper sx={{ padding: 3 }}>
        <ModelTrainingSection aiType={selectedAiType} onTrained={reload} />
      </Paper>
    </Stack>
  );
};

export default AiTrainingPage;
