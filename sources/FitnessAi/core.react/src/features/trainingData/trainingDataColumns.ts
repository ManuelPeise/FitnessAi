import { exerciseTypeLabels, type ExerciseTypeEnum } from "../../lib/enums/exerciseTypeEnum";
import { workoutIntensityLabelKeys, type WorkoutIntensityEnum } from "../../lib/enums/workoutIntensityEnum";
import type { TrainingDataListItem } from "./trainingData.types";

export type TrainingDataColumnKey =
  | "date"
  | "start"
  | "end"
  | "exerciseType"
  | "workoutIntensity"
  | "origin"
  | "system"
  | "durationSeconds"
  | "distanceInMeters"
  | "steps"
  | "stepCadenceAvg"
  | "speedAvg"
  | "elevationAvg"
  | "cyclingPedalingCadenceAvg"
  | "heartRateMin"
  | "heartRateMax"
  | "heartRateAvg"
  | "powerAvg"
  | "oxygenSaturationPercentage"
  | "activeCaloriesBurnedInKcal"
  | "vo2MaxMlPerMinKgAvg";

export type TrainingDataColumnKind = "date" | "time" | "duration" | "text" | "exerciseType" | "workoutIntensity" | "number";

export type TrainingDataColumnDefinition = {
  key: TrainingDataColumnKey;
  labelKey: string;
  kind: TrainingDataColumnKind;
  defaultVisible: boolean;
  // Applied to a "number" column's raw stored value for both display and editing (e.g. meters ->
  // km); the reciprocal is applied when committing an edited value back to the stored field.
  unitScale?: number;
  // Fixed fraction digits for a "number" column's display/edit value - defaults to 0 (rounded
  // integer). Distance is shown with 2 decimals since km values are typically small.
  decimalPlaces?: number;
};

// Default-visible columns match spec section 5; the remaining ones are optional (section 6) and
// hidden by default. All columns go through the same visibility toggle in the settings panel -
// "default" only controls the initial checkbox state.
export const trainingDataColumns: TrainingDataColumnDefinition[] = [
  { key: "date", labelKey: "common.labelDate", kind: "date", defaultVisible: true },
  { key: "start", labelKey: "common.labelStartTime", kind: "time", defaultVisible: true },
  { key: "end", labelKey: "common.labelEndTime", kind: "time", defaultVisible: true },
  { key: "durationSeconds", labelKey: "common.labelDurationSeconds", kind: "duration", defaultVisible: true },
  { key: "origin", labelKey: "common.labelOrigin", kind: "text", defaultVisible: false },
  { key: "system", labelKey: "common.labelSystem", kind: "text", defaultVisible: false },
  { key: "exerciseType", labelKey: "common.labelExerciseType", kind: "exerciseType", defaultVisible: true },
  { key: "activeCaloriesBurnedInKcal", labelKey: "common.labelActiveCaloriesBurnedInKcal", kind: "number", defaultVisible: true },
  { key: "elevationAvg", labelKey: "common.labelElevationAvg", kind: "number", defaultVisible: true },
  { key: "workoutIntensity", labelKey: "common.labelWorkoutIntensity", kind: "workoutIntensity", defaultVisible: true },
  {
    key: "distanceInMeters",
    labelKey: "common.labelDistanceInMeters",
    kind: "number",
    defaultVisible: false,
    unitScale: 1 / 1000,
    decimalPlaces: 2,
  },
  { key: "steps", labelKey: "common.labelSteps", kind: "number", defaultVisible: false },
  { key: "speedAvg", labelKey: "common.labelSpeedAvg", kind: "number", defaultVisible: false },
  { key: "stepCadenceAvg", labelKey: "common.labelStepCadenceAvg", kind: "number", defaultVisible: false },
  { key: "cyclingPedalingCadenceAvg", labelKey: "common.labelCyclingPedalingCadenceAvg", kind: "number", defaultVisible: false },
  { key: "heartRateAvg", labelKey: "common.labelHeartRateAvg", kind: "number", defaultVisible: true },
  { key: "heartRateMin", labelKey: "common.labelHeartRateMin", kind: "number", defaultVisible: false },
  { key: "heartRateMax", labelKey: "common.labelHeartRateMax", kind: "number", defaultVisible: false },
  { key: "powerAvg", labelKey: "common.labelPowerAvg", kind: "number", defaultVisible: false },
  { key: "oxygenSaturationPercentage", labelKey: "common.labelOxygenSaturationPercentage", kind: "number", defaultVisible: true },
  { key: "vo2MaxMlPerMinKgAvg", labelKey: "common.labelVo2MaxAvg", kind: "number", defaultVisible: true },
];

export const defaultVisibleColumns: TrainingDataColumnKey[] = trainingDataColumns
  .filter((column) => column.defaultVisible)
  .map((column) => column.key);

function formatNumber(value: number, decimalPlaces: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

export function getColumnRawValue(item: TrainingDataListItem, key: TrainingDataColumnKey): number | string | null {
  switch (key) {
    case "date":
    case "start":
      return item.startTime;
    case "end":
      return item.endTime;
    case "exerciseType":
      return item.exerciseType;
    case "workoutIntensity":
      return item.workoutIntensity;
    case "origin":
      return item.origin;
    case "system":
      return item.system;
    default:
      return item[key];
  }
}

// Fixed dd.MM.yyyy - independent of the viewer's browser locale, so the column never mixes
// "d.MM.yyyy"/"dd.M.yyyy" depending on where it renders.
export function formatFixedDate(isoValue: string): string {
  const date = new Date(isoValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function formatDurationSeconds(totalSeconds: number): string {
  const wholeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = wholeSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

// Accepts "HH:MM:SS", "MM:SS" or a plain number of seconds; returns null when unparseable.
export function parseDurationSeconds(text: string): number | null {
  const trimmed = text.trim();

  if (trimmed === "") {
    return null;
  }

  if (!trimmed.includes(":")) {
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const parts = trimmed.split(":").map((part) => Number(part));

  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return null;
}

export function getColumnDisplayText(
  item: TrainingDataListItem,
  column: TrainingDataColumnDefinition,
  getResource: (key: string) => string,
): string {
  const value = getColumnRawValue(item, column.key);

  switch (column.kind) {
    case "date":
      return typeof value === "string" ? formatFixedDate(value) : "";
    case "time":
      return typeof value === "string" ? new Date(value).toLocaleTimeString() : "";
    case "duration":
      return typeof value === "number" ? formatDurationSeconds(value) : "";
    case "exerciseType":
      return exerciseTypeLabels[value as ExerciseTypeEnum] ?? String(value ?? "");
    case "workoutIntensity":
      return value === null
        ? getResource("common.workoutIntensity.unknown")
        : getResource(workoutIntensityLabelKeys[value as WorkoutIntensityEnum]);
    case "number":
      return typeof value === "number"
        ? formatNumber(value * (column.unitScale ?? 1), column.decimalPlaces ?? 0)
        : "";
    case "text":
    default:
      return value === null ? "" : String(value);
  }
}
