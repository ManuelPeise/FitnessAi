type Listener = () => void;

let activeRequestCount = 0;
const listeners = new Set<Listener>();

const notify = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeToHttpActivity = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getIsHttpActive = (): boolean => activeRequestCount > 0;

export const beginHttpRequest = (): void => {
  activeRequestCount += 1;

  if (activeRequestCount === 1) {
    notify();
  }
};

export const endHttpRequest = (): void => {
  activeRequestCount = Math.max(0, activeRequestCount - 1);

  if (activeRequestCount === 0) {
    notify();
  }
};
