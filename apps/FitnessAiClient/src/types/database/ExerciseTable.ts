import type { TableBase } from './TabelBase';

export type ExerciseTable = TableBase & {
  userId: number;
  exerciseId: number;
  dataOrigin?: string | null;
  exerciseType: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
};
