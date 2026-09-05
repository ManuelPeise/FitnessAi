import React from 'react';
import {
  ScheduleSettingsType,
  ScheduleSettingsTableEntry,
  ScheduleFrequency,
} from '../lib/database/databaseTypes';
import { databaseAccessor } from '../lib/database/database';
import { DropdownItem } from '../components/inputComponents/Dropdown';
import { useAuthenticationContext } from './useAuthenticationContext';
import { getResource } from '../lib/localization';

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
  reloadSchedule: () => Promise<void>;
  handleResetSchedule: () => void;
  handleSaveSchedule: () => Promise<void>;
  handleFrequencyChanged: (frequency: ScheduleFrequency) => void;
  handleScheduleChange: (
    partialSchedule: Partial<ScheduleSettingsTableEntry>,
  ) => void;
};

const createDefaultSchedule = (
  userId: number,
  type: ScheduleSettingsType,
): ScheduleSettingsTableEntry => ({
  id: 0,
  userId,
  type,
  isActive: false,
  hour: 0,
  minute: 0,
  frequency: 'daily',
  dayOfWeek: 0,
  lastExecutedAt: null,
  lastExecutionStatus: 'idle',
  lastExecutionError: null,
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
  const { currentUserId } = useAuthenticationContext();
  const databaseAccessorRef = React.useRef(databaseAccessor);

  const [state, setState] = React.useState<ScheduleSettingsState>({
    originalSchedule: null,
    currentSchedule: null,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);

  const reloadSchedule = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      if (currentUserId == null) {
        throw new Error(
          getResource('healthConnect.descriptionMissingUserContext'),
        );
      }

      const storedSchedule =
        await databaseAccessorRef.current.schedule.getSchedule(
          currentUserId,
          type,
        );

      const loadedSchedule =
        storedSchedule ?? createDefaultSchedule(currentUserId, type);

      setState({
        originalSchedule: loadedSchedule,
        currentSchedule: loadedSchedule,
      });
    } catch (loadError) {
      console.error(
        getResource('healthConnect.descriptionScheduleLoadFailed'),
        loadError,
      );
      setError(getResource('healthConnect.descriptionScheduleLoadFailed'));
      setState({ originalSchedule: null, currentSchedule: null });
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, type]);

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
      console.error(
        getResource('healthConnect.descriptionScheduleSaveFailed'),
        saveError,
      );
      setError(getResource('healthConnect.descriptionScheduleSaveFailed'));
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

  const dayOptions: DropdownItem<number>[] = [
    getResource('healthConnect.labelSunday'),
    getResource('healthConnect.labelMonday'),
    getResource('healthConnect.labelTuesday'),
    getResource('healthConnect.labelWednesday'),
    getResource('healthConnect.labelThursday'),
    getResource('healthConnect.labelFriday'),
    getResource('healthConnect.labelSaturday'),
  ].map((label, index) => ({ label, value: index }));

  const frequencyOptions: DropdownItem<ScheduleFrequency>[] = [
    { label: getResource('healthConnect.labelDaily'), value: 'daily' },
    { label: getResource('healthConnect.labelHourly'), value: 'hourly' },
    { label: getResource('healthConnect.labelWeekly'), value: 'weekly' },
  ];

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
    reloadSchedule();
  }, [reloadSchedule]);

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
    reloadSchedule,
    handleFrequencyChanged,
    handleScheduleChange,
    handleResetSchedule,
    handleSaveSchedule,
  };
};
