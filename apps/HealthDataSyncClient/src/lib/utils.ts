export const utils = {
  dateToString: (date: Date) => {
    return date.toISOString();
  },
  getStartOfDay: (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  },
  getEndOfDay: (date: Date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  },
  getPreviousDate: (date: Date, daysBefore: number) => {
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - daysBefore);
    return previousDate;
  },
  getSumOf: (numbers: number[]) => {
    return numbers.reduce((a, b) => a + b, 0);
  },
  distinctBy: <T>(array: T[], keyFn: (item: T) => unknown): T[] => {
    const seen = new Set<unknown>();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },
  groupBy: <T>(
    array: T[],
    keyFn: (item: T) => unknown,
  ): Record<string, T[]> => {
    return array.reduce((acc, item) => {
      const key = String(keyFn(item));
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  },
  toBatches: <T>(array: T[], batchSize: number): T[][] => {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  },
  getDatesFromRange: (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  },
  getDurationSeconds: (
    startDate: Date | string,
    endDate: Date | string,
  ): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.floor((end - start) / 1000);
  },
};
