import React from 'react';
import { useScheduleSettings } from '../../hooks/useScheduleSettings';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { globalStyles } from '../../lib/styles/globalStyles';
import type {
  ScheduleFrequency,
  ScheduleSettingsType,
} from '../../lib/database/databaseTypes';
import IconComponent from '../../components/IconComponent';
import { colorMap } from '../../lib/styles/colorMap';
import Dropdown from '../../components/inputComponents/Dropdown';
import ButtonComponent from '../../components/inputComponents/ButtonComponent';
import SwitchComponent from '../../components/inputComponents/SwitchComponent';
import { healthConnectScheduleExecutionService } from '../../lib/services/scheduler/healthConnectScheduleExecutionService';

type ScheduleTab = {
  type: ScheduleSettingsType;
  label: string;
};

const scheduleTabs: ScheduleTab[] = [
  { type: 'HealthConnectExerciseDataExport', label: 'Exercise Data Export' },
];

const HealthConnectScheduleSettings: React.FC = () => {
  const [type, setType] = React.useState<ScheduleSettingsType>(
    'HealthConnectExerciseDataExport',
  );
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionFeedback, setExecutionFeedback] = React.useState<{
    message: string;
    kind: 'success' | 'error';
  } | null>(null);
  const [initialLoadDays, setInitialLoadDays] = React.useState('1');

  const {
    schedule,
    isLoading,
    isSaving,
    isModified,
    error,
    isSaved,
    frequencyOptions,
    hourOptions,
    minuteOptions,
    dayOptions,
    reloadSchedule,
    handleResetSchedule,
    handleSaveSchedule,
    handleFrequencyChanged,
    handleScheduleChange,
  } = useScheduleSettings(type);

  const isWeekly = schedule?.frequency === 'weekly';
  const isHourly = schedule?.frequency === 'hourly';
  const isBusy = isLoading || isSaving || isExecuting;

  const handleExecuteNow = React.useCallback(async () => {
    setExecutionFeedback(null);
    setIsExecuting(true);

    try {
      const result = await healthConnectScheduleExecutionService.executeManually(
        type,
      );

      await reloadSchedule();

      if (!result.success) {
        setExecutionFeedback({
          kind: 'error',
          message: result.message ?? 'Schedule execution failed.',
        });
        return;
      }

      setExecutionFeedback({
        kind: 'success',
        message:
          result.pushedItems > 0
            ? `Execution completed and pushed ${result.pushedItems} item(s).`
            : 'Execution completed. No mapped data to push.',
      });
    } catch (executionError) {
      console.error('Failed to execute schedule manually.', executionError);
      setExecutionFeedback({
        kind: 'error',
        message: 'Schedule execution failed.',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [reloadSchedule, type]);

  const handleInitialLoadDaysChanged = React.useCallback((value: string) => {
    const normalized = value.replace(/[^0-9]/g, '');
    setInitialLoadDays(normalized);
  }, []);

  const parsedInitialLoadDays = React.useMemo(() => {
    if (initialLoadDays.trim().length === 0) {
      return null;
    }

    const value = Number(initialLoadDays);

    if (!Number.isInteger(value)) {
      return null;
    }

    return value;
  }, [initialLoadDays]);

  const isInitialLoadValid =
    parsedInitialLoadDays != null &&
    parsedInitialLoadDays >= 1 &&
    parsedInitialLoadDays <= 365;

  const handleInitialLoad = React.useCallback(async () => {
    if (!isInitialLoadValid || parsedInitialLoadDays == null) {
      setExecutionFeedback({
        kind: 'error',
        message: 'Initial load days must be between 1 and 365.',
      });
      return;
    }

    setExecutionFeedback(null);
    setIsExecuting(true);

    try {
      const result = await healthConnectScheduleExecutionService.executeManually(
        type,
        {
          initialLoadDays: parsedInitialLoadDays,
        },
      );

      await reloadSchedule();

      if (!result.success) {
        setExecutionFeedback({
          kind: 'error',
          message: result.message ?? 'Initial load failed.',
        });
        return;
      }

      setExecutionFeedback({
        kind: 'success',
        message:
          result.pushedItems > 0
            ? `Initial load completed and pushed ${result.pushedItems} item(s).`
            : 'Initial load completed. No mapped data to push.',
      });
    } catch (executionError) {
      console.error('Failed to execute initial load.', executionError);
      setExecutionFeedback({
        kind: 'error',
        message: 'Initial load failed.',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [isInitialLoadValid, parsedInitialLoadDays, reloadSchedule, type]);

  React.useEffect(() => {
    setExecutionFeedback(null);
  }, [type]);

  return (
    <View style={globalStyles.container}>
      <View style={styles.tabSelectionContainer}>
        {scheduleTabs.map(tab => {
          const isSelected = type === tab.type;

          return (
            <TouchableOpacity
              key={tab.type}
              style={[
                styles.tabSelection,
                isSelected && styles.tabSelectionSelected,
              ]}
              onPress={() => setType(tab.type)}
              disabled={isSaving}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <IconComponent
                name="schedule"
                size={24}
                color={isSelected ? colorMap.primary : colorMap.secondary}
              />
              <Text style={isSelected ? styles.tabLabelSelected : undefined}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading || schedule == null ? (
        <View style={styles.stateContainer}>
          {isLoading ? (
            <ActivityIndicator color={colorMap.primary} />
          ) : (
            <Text style={styles.errorText}>
              {error ?? 'No schedule available.'}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.row}>
            <View style={styles.activeRow}>
              <Text style={styles.activeLabel}>Active</Text>
              <SwitchComponent
                checked={schedule.isActive}
                disabled={isSaving}
                onValueChange={isActive => handleScheduleChange({ isActive })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.fullWidthColumn}>
              <Dropdown<ScheduleFrequency>
                label="Select frequency"
                value={schedule.frequency}
                items={frequencyOptions}
                disabled={isSaving}
                onChange={handleFrequencyChanged}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.fullWidthColumn}>
              <Dropdown<number>
                label="Select day"
                value={schedule.dayOfWeek}
                items={dayOptions}
                disabled={isSaving || !isWeekly}
                onChange={dayOfWeek => handleScheduleChange({ dayOfWeek })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Dropdown<number>
                label="Select hour"
                value={schedule.hour}
                items={hourOptions}
                disabled={isSaving || isHourly}
                onChange={hour => handleScheduleChange({ hour })}
              />
            </View>

            <View style={styles.column}>
              <Dropdown<number>
                label="Select minute"
                value={schedule.minute}
                items={minuteOptions}
                disabled={isSaving}
                onChange={minute => handleScheduleChange({ minute })}
              />
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {schedule.lastExecutedAt && (
            <Text style={styles.infoText}>
              Last execution: {new Date(schedule.lastExecutedAt).toLocaleString()}
            </Text>
          )}
          <Text style={styles.infoText}>
            Last status: {schedule.lastExecutionStatus}
          </Text>
          {schedule.lastExecutionError && (
            <Text style={styles.errorText}>{schedule.lastExecutionError}</Text>
          )}
          {isSaved && !isModified && (
            <Text style={styles.successText}>Schedule saved.</Text>
          )}
          {executionFeedback && (
            <Text
              style={
                executionFeedback.kind === 'success'
                  ? styles.successText
                  : styles.errorText
              }
            >
              {executionFeedback.message}
            </Text>
          )}

          <View style={styles.buttons}>
            {isSaving && <ActivityIndicator color={colorMap.primary} />}
            {isExecuting && <ActivityIndicator color={colorMap.primary} />}
            <View style={styles.initialLoadContainer}>
              <Text style={styles.initialLoadLabel}>Initial load days</Text>
              <TextInput
                style={styles.initialLoadInput}
                value={initialLoadDays}
                onChangeText={handleInitialLoadDaysChanged}
                editable={!isBusy}
                keyboardType="number-pad"
                maxLength={3}
              />
              <ButtonComponent
                title="Initial load"
                disabled={isBusy || !isInitialLoadValid}
                onPress={handleInitialLoad}
              />
            </View>
            <ButtonComponent
              title="Run now"
              disabled={isBusy}
              onPress={handleExecuteNow}
            />
            <ButtonComponent
              title="Cancel"
              disabled={!isModified || isBusy}
              onPress={handleResetSchedule}
            />
            <ButtonComponent
              title="Save"
              disabled={!isModified || isBusy}
              onPress={handleSaveSchedule}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabSelectionContainer: {
    flexDirection: 'row',
  },
  tabSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: colorMap.transparent,
  },
  tabSelectionSelected: {
    borderBottomWidth: 2,
    borderBottomColor: colorMap.primary,
  },
  tabLabelSelected: {
    color: colorMap.primary,
    fontWeight: '600',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    marginTop: 30,
  },
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 5,
    padding: 5,
    width: '100%',
  },
  activeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorMap.secondary,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  fullWidthColumn: {
    flex: 1,
  },
  errorText: {
    color: colorMap.error,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  successText: {
    color: colorMap.success,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  infoText: {
    color: colorMap.info,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  buttons: {
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 15,
    marginTop: 25,
  },
  initialLoadContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  initialLoadLabel: {
    color: colorMap.secondary,
    fontSize: 13,
  },
  initialLoadInput: {
    minWidth: 60,
    borderWidth: 1,
    borderColor: colorMap.disabled,
    borderRadius: 4,
    color: colorMap.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
  },
});
export default HealthConnectScheduleSettings;
