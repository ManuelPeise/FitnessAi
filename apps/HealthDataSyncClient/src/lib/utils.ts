export const utils = {
  dateToString: (date: Date) => {
    return date.toISOString();
  },
  getStartOfDay: (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
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
};
