import { AiModelTypeEnum } from "../../lib/enums/aiModelTypeEnum";
import type { AiModelDefinition } from "./aiTraining.types";

export const aiModelDefinitions: AiModelDefinition[] = [
  {
    aiType: AiModelTypeEnum.WorkoutIntensity,
    labelKey: "common.model.workoutIntensity",
  },
];

export const supportsTrainingFile = (aiType: AiModelTypeEnum): boolean =>
  aiType === AiModelTypeEnum.WorkoutIntensity;
