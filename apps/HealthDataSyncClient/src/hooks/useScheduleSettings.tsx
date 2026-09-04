import React from 'react';
import {
  ScheduleSettingsType,
  ScheduleSettingsTableEntry,
  ScheduleFrequency,
} from '../lib/database/databaseTypes';
import { databaseAccessor } from '../lib/database/database';
import { DropdownItem } from '../components/inputComponents/Dropdown';

type ScheduleSettingsState = {
  originalSchedule: ScheduleSettingsTableEntry | null;
  currentSchedule: ScheduleSettingsTableEntry | null;
};

type UseScheduleSettingsReturnType = {
  schedule: ScheduleSettingsTableEntry | null;
  isLoading: boolean;
  isSaving: boolean;
  isModified: boolean;
  error: string | null;
  isSaved: boolean;
  dayOptions: DropdownItem<number>[];
  frequencyOptions: DropdownItem<ScheduleFrequency>[];
  hourOptions: DropdownItem<number>[];
  minuteOptions: DropdownItem<number>[];
  handleResetSchedule: () => void;
  handleSaveSchedule: () => Promise<void>;
  handleFrequencyChanged: (frequency: ScheduleFrequency) => void;
  handleScheduleChange: (
    partialSchedule: Partial<ScheduleSettingsTableEntry>,
  ) => void;
};

const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const createDefaultSchedule = (
  type: ScheduleSettingsType,
): ScheduleSettingsTableEntry => ({
  id: 0,
  type,
  isActive: false,
  hour: 0,
  minute: 0,
  frequency: 'daily',
  dayOfWeek: 0,
  lastExecutedAt: null,
});

/**
 * Fields that carry no meaning for the selected frequency are reset, so a
 * persisted row never contains stale values behind a disabled input.
 */
const normalizeSchedule = (
  schedule: ScheduleSettingsTableEntry,
): ScheduleSettingsTableEntry => {
  switch (schedule.frequency) {
    case 'hourly':
      return { ...schedule, dayOfWeek: 0, hour: 0 };
    case 'daily':
      return { ...schedule, dayOfWeek: 0 };
    default:
      return schedule;
  }
};

const areSchedulesEqual = (
  left: ScheduleSettingsTableEntry,
  right: ScheduleSettingsTableEntry,
): boolean =>
  left.isActive === right.isActive &&
  left.frequency === right.frequency &&
  left.hour === right.hour &&
  left.minute === right.minute &&
  left.dayOfWeek === right.dayOfWeek;

export const useScheduleSettings = (
  type: ScheduleSettingsType,
): UseScheduleSettingsReturnType => {
  const databaseAccessorRef = React.useRef(databaseAccessor);

  const [state, setState] = React.useState<ScheduleSettingsState>({
    originalSchedule: null,
    currentSchedule: null,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleScheduleChange = React.useCallback(
    (partialSchedule: Partial<ScheduleSettingsTableEntry>) => {
      setIsSaved(false);
      setState(previous =>
        previous.currentSchedule == null
          ? previous
          : {
              ...previous,
              currentSchedule: {
                ...previous.currentSchedule,
                ...partialSchedule,
              },
            },
      );
    },
    [],
  );

  const handleFrequencyChanged = React.useCallback(
    (frequency: ScheduleFrequency) => {
      setIsSaved(false);
      setState(previous =>
        previous.currentSchedule == null
          ? previous
          : {
              ...previous,
              currentSchedule: normalizeSchedule({
                ...previous.currentSchedule,
                frequency,
              }),
            },
      );
    },
    [],
  );

  const handleResetSchedule = React.useCallback(() => {
    setError(null);
    setIsSaved(false);
    setState(previous => ({
      ...previous,
      currentSchedule: previous.originalSchedule,
    }));
  }, []);

  const handleSaveSchedule = React.useCallback(async () => {
    if (state.currentSchedule == null) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setIsSaved(false);

    try {
      const persistedSchedule =
        await databaseAccessorRef.current.schedule.saveSchedule(
          normalizeSchedule(state.currentSchedule),
        );

      setState({
        originalSchedule: persistedSchedule,
        currentSchedule: persistedSchedule,
      });
      setIsSaved(true);
    } catch (saveError) {
      console.error('Failed to save the schedule.', saveError);
      setError('The schedule could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [state.currentSchedule]);

  const isModified = React.useMemo(() => {
    const { originalSchedule, currentSchedule } = state;

    if (originalSchedule == null || currentSchedule == null) {
      return false;
    }

    return !areSchedulesEqual(originalSchedule, currentSchedule);
  }, [state]);

  const dayOptions = React.useMemo(
    (): DropdownItem<number>[] =>
      weekDays.map((label, index) => ({ label, value: index })),
    [],
  );

  const frequencyOptions = React.useMemo(
    (): DropdownItem<ScheduleFrequency>[] => [
      { label: 'Daily', value: 'daily' },
      { label: 'Hourly', value: 'hourly' },
      { label: 'Weekly', value: 'weekly' },
    ],
    [],
  );

  const hourOptions = React.useMemo(
    (): DropdownItem<number>[] =>
      Array.from({ length: 24 }, (_, hour) => ({
        label: hour.toString().padStart(2, '0'),
        value: hour,
      })),
    [],
  );

  const minuteOptions = React.useMemo(
    (): DropdownItem<number>[] =>
      [0, 15, 30, 45].map(minute => ({
        label: minute.toString().padStart(2, '0'),
        value: minute,
      })),
    [],
  );

  React.useEffect(() => {
    let isActiveEffect = true;

    const loadSchedule = async () => {
      setIsLoading(true);
      setError(null);
      setIsSaved(false);

      try {
        const storedSchedule =
          await databaseAccessorRef.current.schedule.getSchedule(type);
        const loadedSchedule = storedSchedule ?? createDefaultSchedule(type);

        if (!isActiveEffect) {
          return;
        }

        setState({
          originalSchedule: loadedSchedule,
          currentSchedule: loadedSchedule,
        });
      } catch (loadError) {
        console.error('Failed to load the schedule.', loadError);

        if (isActiveEffect) {
          setError('The schedule could not be loaded.');
          setState({ originalSchedule: null, currentSchedule: null });
        }
      } finally {
        if (isActiveEffect) {
          setIsLoading(false);
        }
      }
    };

    loadSchedule();

    return () => {
      isActiveEffect = false;
    };
  }, [type]);

  return {
    schedule: state.currentSchedule,
    isLoading,
    isSaving,
    isModified,
    error,
    isSaved,
    dayOptions,
    frequencyOptions,
    hourOptions,
    minuteOptions,
    handleFrequencyChanged,
    handleScheduleChange,
    handleResetSchedule,
    handleSaveSchedule,
  };
};
