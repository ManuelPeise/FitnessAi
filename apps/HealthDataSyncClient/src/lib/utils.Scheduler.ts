import { utils } from './utils';

export const utilsScheduler = {
  getDateRangeForExecution: (
    endTimeStamp: Date,
    initialLoadDays?: number,
  ): { startTimeStamp: Date; endTimeStamp: Date } => {
    const startTimeStamp =
      initialLoadDays != null
        ? utils.getStartOfDay(
            utils.getPreviousDate(endTimeStamp, initialLoadDays),
          )
        : utils.getStartOfDay(endTimeStamp);

    return { startTimeStamp, endTimeStamp };
  },

  chunkDateRange: (
    from: Date,
    to: Date,
    chunkSizeDays: number,
  ): Array<{ from: Date; to: Date }> => {
    const chunks: Array<{ from: Date; to: Date }> = [];
    let chunkStart = new Date(from);

    while (chunkStart <= to) {
      const chunkEnd = new Date(chunkStart);
      chunkEnd.setDate(chunkEnd.getDate() + chunkSizeDays - 1);

      const boundedEnd = chunkEnd > to ? new Date(to) : chunkEnd;
      chunks.push({ from: new Date(chunkStart), to: boundedEnd });

      chunkStart = new Date(boundedEnd);
      chunkStart.setDate(chunkStart.getDate() + 1);
    }

    return chunks;
  },
};
