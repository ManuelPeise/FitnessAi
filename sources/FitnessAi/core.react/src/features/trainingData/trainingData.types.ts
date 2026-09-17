import type { ExerciseTypeEnum } from "../../lib/enums/exerciseTypeEnum";
import type { WorkoutIntensityEnum } from "../../lib/enums/workoutIntensityEnum";

export type TrainingDataListItem = {
  id: number;
  origin: string;
  system: string;
  startTime: string;
  endTime: string;
  durationSeconds: number | null;
  exerciseType: ExerciseTypeEnum;
  distanceInMeters: number | null;
  elevationAvg: number | null;
  steps: number | null;
  stepCadenceAvg: number | null;
  speedAvg: number | null;
  cyclingPedalingCadenceAvg: number | null;
  heartRateMin: number | null;
  heartRateMax: number | null;
  heartRateAvg: number | null;
  powerAvg: number | null;
  oxygenSaturationPercentage: number | null;
  activeCaloriesBurnedInKcal: number | null;
  vo2MaxMlPerMinKgAvg: number | null;
  workoutIntensity: WorkoutIntensityEnum | null;
};

export type TrainingDataQueryResult = {
  items: TrainingDataListItem[];
  totalCount: number;
  availableExerciseTypes: ExerciseTypeEnum[];
};

export type TrainingDataFilter = {
  exerciseType: ExerciseTypeEnum | null;
  from: string | null;
  to: string | null;
  page: number;
  pageSize: number;
};

export type EditableTrainingDataField =
  | "durationSeconds"
  | "distanceInMeters"
  | "elevationAvg"
  | "steps"
  | "stepCadenceAvg"
  | "speedAvg"
  | "cyclingPedalingCadenceAvg"
  | "heartRateMin"
  | "heartRateMax"
  | "heartRateAvg"
  | "powerAvg"
  | "oxygenSaturationPercentage"
  | "activeCaloriesBurnedInKcal"
  | "vo2MaxMlPerMinKgAvg"
  | "workoutIntensity";

export type TrainingDataUpdateRequest = Pick<TrainingDataListItem, EditableTrainingDataField> & {
  id: number;
};

export type TrainingDataPrediction = {
  id: number;
  workoutIntensity: WorkoutIntensityEnum;
};
