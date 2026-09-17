import { getColumnDisplayText, type TrainingDataColumnDefinition } from "./trainingDataColumns";
import type { TrainingDataListItem } from "./trainingData.types";

const cellHorizontalPaddingPx = 32;
const minColumnWidthPx = 72;

let measureContext: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") {
    return null;
  }

  measureContext ??= document.createElement("canvas").getContext("2d");
  return measureContext;
}

function measureTextWidth(text: string, font: string): number {
  const context = getMeasureContext();

  if (!context || text === "") {
    return 0;
  }

  context.font = font;
  return context.measureText(text).width;
}

// Reads the table's actual rendered font once, rather than hardcoding a value, so width
// calculation tracks the app's real theme/typography instead of drifting from it.
export function getTableFont(): string {
  if (typeof document === "undefined") {
    return "400 0.875rem Roboto, sans-serif";
  }

  const probe = document.createElement("span");
  probe.className = "MuiTypography-body2";
  probe.style.visibility = "hidden";
  probe.style.position = "absolute";
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe);
  const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;

  document.body.removeChild(probe);
  return font;
}

// Column width = max(header width, longest displayed value width) + padding - never derived
// from the header alone, per spec.
export function computeColumnWidths(
  columns: TrainingDataColumnDefinition[],
  items: TrainingDataListItem[],
  getResource: (key: string) => string,
  font: string,
): Record<string, number> {
  const boldFont = font.replace(/^\d+/, "600");
  const widths: Record<string, number> = {};

  for (const column of columns) {
    const headerWidth = measureTextWidth(getResource(column.labelKey), boldFont);

    let longestCellWidth = 0;
    for (const item of items) {
      const cellWidth = measureTextWidth(getColumnDisplayText(item, column, getResource), font);
      longestCellWidth = Math.max(longestCellWidth, cellWidth);
    }

    // Dropdown editors (WorkoutIntensity/ExerciseType) render a select-arrow affordance beyond
    // the plain text width, so they get extra breathing room on top of the measured content.
    const editorAffordancePx = column.kind === "workoutIntensity" || column.kind === "exerciseType" ? 32 : 0;
    const contentWidth = Math.max(headerWidth, longestCellWidth, minColumnWidthPx - cellHorizontalPaddingPx);
    widths[column.key] = Math.ceil(contentWidth + cellHorizontalPaddingPx + editorAffordancePx);
  }

  return widths;
}
