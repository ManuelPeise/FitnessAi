import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type {
  ScheduleSettingsType,
  ScheduleFrequency,
} from '../../lib/database/databaseTypes';
import { useScheduleSettings } from '../../hooks/useScheduleSettings';
import { globalStyles } from '../../lib/styles/globalStyles';
import { colorMap } from '../../lib/styles/colorMap';
import Dropdown from '../../components/inputComponents/Dropdown';
import ButtonComponent from '../../components/inputComponents/ButtonComponent';
import SwitchComponent from '../../components/inputComponents/SwitchComponent';
import { healthConnectScheduleExecutionService } from '../../lib/services/scheduler/healthConnectScheduleService';
import { ILocaleProps, withLocalNameSpaces } from '../../lib/localization';
import HealthConnectInitialLoadModal from './components/HealthConnectInitialLoadModal';

type ScheduleState = ReturnType<typeof useScheduleSettings>;

const buildSuccessMessage = (resourcePrefix: string, pushedItems: number) => {
  return `${resourcePrefix} ${pushedItems}.`;
};

const HealthConnectScheduleSettings: React.FC<ILocaleProps> = props => {
  const { getResource } = props;
  const exerciseSchedule = useScheduleSettings(
    'HealthConnectExerciseDataExport',
  );
  const healthDataSchedule = useScheduleSettings(
    'HealthConnectHealthDataExport',
  );
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionFeedback, setExecutionFeedback] = React.useState<{
    message: string;
    kind: 'success' | 'error';
  } | null>(null);
  const [isInitializeModalVisible, setIsInitializeModalVisible] =
    React.useState(false);
  const [initialLoadDays, setInitialLoadDays] = React.useState('1');
  const [loadExerciseSchedule, setLoadExerciseSchedule] = React.useState(false);
  const [loadHealthDataSchedule, setLoadHealthDataSchedule] =
    React.useState(false);

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

  const canLoadInitialize =
    isInitialLoadValid &&
    (loadExerciseSchedule || loadHealthDataSchedule) &&
    !isExecuting;

  const getRunDisabledHint = React.useCallback(
    (scheduleState: ScheduleState) => {
      if (
        scheduleState.isLoading ||
        scheduleState.schedule == null ||
        isExecuting
      ) {
        return null;
      }

      if (!scheduleState.schedule.isActive) {
        return getResource(
          'healthConnect.descriptionRunNowNeedsActiveSchedule',
        );
      }

      if (scheduleState.isModified) {
        return getResource('healthConnect.descriptionRunNowNeedsSavedSchedule');
      }

      return null;
    },
    [getResource, isExecuting],
  );

  const runSchedule = React.useCallback(
    async (
      type: ScheduleSettingsType,
      scheduleState: ScheduleState,
      options?: { initialLoadDays?: number },
    ) => {
      setExecutionFeedback(null);
      setIsExecuting(true);

      try {
        const result =
          await healthConnectScheduleExecutionService.executeManually(
            type,
            options,
          );

        await scheduleState.reloadSchedule();

        if (!result.success) {
          return {
            success: false,
            pushedItems: 0,
            message:
              result.message ??
              getResource('healthConnect.descriptionScheduleExecutionFailed'),
          };
        }

        const message =
          options?.initialLoadDays != null
            ? result.pushedItems > 0
              ? buildSuccessMessage(
                  getResource(
                    'healthConnect.descriptionInitialLoadCompletedPrefix',
                  ),
                  result.pushedItems,
                )
              : getResource(
                  'healthConnect.descriptionInitialLoadCompletedNoData',
                )
            : result.pushedItems > 0
            ? buildSuccessMessage(
                getResource(
                  'healthConnect.descriptionExecutionCompletedPrefix',
                ),
                result.pushedItems,
              )
            : getResource('healthConnect.descriptionExecutionCompletedNoData');

        return {
          success: true,
          pushedItems: result.pushedItems,
          message,
        };
      } catch (executionError) {
        console.error(
          getResource('healthConnect.descriptionScheduleExecutionFailed'),
          executionError,
        );
        return {
          success: false,
          pushedItems: 0,
          message:
            options?.initialLoadDays != null
              ? getResource('healthConnect.descriptionInitialLoadFailed')
              : getResource('healthConnect.descriptionScheduleExecutionFailed'),
        };
      } finally {
        setIsExecuting(false);
      }
    },
    [getResource],
  );

  const handleExecuteNow = React.useCallback(
    async (type: ScheduleSettingsType, scheduleState: ScheduleState) => {
      const result = await runSchedule(type, scheduleState);

      if (!result) {
        return;
      }

      setExecutionFeedback({
        kind: result.success ? 'success' : 'error',
        message: result.message,
      });
    },
    [runSchedule],
  );

  const handleInitialize = React.useCallback(async () => {
    if (!isInitialLoadValid || parsedInitialLoadDays == null) {
      setExecutionFeedback({
        kind: 'error',
        message: getResource(
          'healthConnect.descriptionInitialLoadRangeInvalid',
        ),
      });
      return;
    }

    const selectedSchedules: Array<{
      type: ScheduleSettingsType;
      state: ScheduleState;
    }> = [];

    if (loadExerciseSchedule) {
      selectedSchedules.push({
        type: 'HealthConnectExerciseDataExport',
        state: exerciseSchedule,
      });
    }

    if (loadHealthDataSchedule) {
      selectedSchedules.push({
        type: 'HealthConnectHealthDataExport',
        state: healthDataSchedule,
      });
    }

    let pushedItems = 0;

    for (let i = 0; i < selectedSchedules.length; i++) {
      const selection = selectedSchedules[i];
      const result = await runSchedule(selection.type, selection.state, {
        initialLoadDays: parsedInitialLoadDays,
      });

      if (!result) {
        continue;
      }

      if (!result.success) {
        setExecutionFeedback({
          kind: 'error',
          message: result.message,
        });
        return;
      }

      pushedItems += result.pushedItems;
    }

    setExecutionFeedback({
      kind: 'success',
      message:
        pushedItems > 0
          ? buildSuccessMessage(
              getResource(
                'healthConnect.descriptionInitialLoadCompletedPrefix',
              ),
              pushedItems,
            )
          : getResource('healthConnect.descriptionInitialLoadCompletedNoData'),
    });
    setIsInitializeModalVisible(false);
  }, [
    exerciseSchedule,
    getResource,
    healthDataSchedule,
    isInitialLoadValid,
    loadExerciseSchedule,
    loadHealthDataSchedule,
    parsedInitialLoadDays,
    runSchedule,
  ]);

  const renderScheduleCard = React.useCallback(
    (
      scheduleType: ScheduleSettingsType,
      titleResource: string,
      scheduleState: ScheduleState,
    ) => {
      if (scheduleState.isLoading || scheduleState.schedule == null) {
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {getResource(titleResource)}
            </Text>
            <ActivityIndicator color={colorMap.primary} />
            {scheduleState.error ? (
              <Text style={styles.errorText}>{scheduleState.error}</Text>
            ) : null}
          </View>
        );
      }

      const { schedule } = scheduleState;
      const isWeekly = schedule.frequency === 'weekly';
      const isHourly = schedule.frequency === 'hourly';
      const isBusy = scheduleState.isSaving || isExecuting;
      const isRunNowDisabled =
        isBusy ||
        schedule == null ||
        !schedule.isActive ||
        scheduleState.isModified;

      const runDisabledHint = getRunDisabledHint(scheduleState);

      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{getResource(titleResource)}</Text>
          <Text style={styles.cardCaption}>
            {getResource('healthConnect.captionScheduleConfiguration')}
          </Text>
          <View style={styles.activeRow}>
            <Text style={styles.activeLabel}>
              {getResource('common.labelActive')}
            </Text>
            <SwitchComponent
              checked={schedule.isActive}
              disabled={scheduleState.isSaving || isExecuting}
              onValueChange={isActive =>
                scheduleState.handleScheduleChange({ isActive })
              }
            />
          </View>

          <Dropdown<ScheduleFrequency>
            label={getResource('common.labelSelectFrequency')}
            value={schedule.frequency}
            items={scheduleState.frequencyOptions}
            disabled={scheduleState.isSaving || isExecuting}
            onChange={scheduleState.handleFrequencyChanged}
          />

          <Dropdown<number>
            label={getResource('common.labelSelectDay')}
            value={schedule.dayOfWeek}
            items={scheduleState.dayOptions}
            disabled={scheduleState.isSaving || isExecuting || !isWeekly}
            onChange={dayOfWeek =>
              scheduleState.handleScheduleChange({ dayOfWeek })
            }
          />

          <View style={styles.timeRow}>
            <View style={styles.column}>
              <Dropdown<number>
                label={getResource('common.labelSelectHour')}
                value={schedule.hour}
                items={scheduleState.hourOptions}
                disabled={scheduleState.isSaving || isExecuting || isHourly}
                onChange={hour => scheduleState.handleScheduleChange({ hour })}
              />
            </View>
            <View style={styles.column}>
              <Dropdown<number>
                label={getResource('common.labelSelectMinute')}
                value={schedule.minute}
                items={scheduleState.minuteOptions}
                disabled={scheduleState.isSaving || isExecuting}
                onChange={minute =>
                  scheduleState.handleScheduleChange({ minute })
                }
              />
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <ButtonComponent
              title={getResource('common.labelCancel')}
              disabled={!scheduleState.isModified || isBusy}
              onPress={scheduleState.handleResetSchedule}
            />
            <ButtonComponent
              title={getResource('common.labelSave')}
              disabled={!scheduleState.isModified || isBusy}
              onPress={scheduleState.handleSaveSchedule}
            />
            <ButtonComponent
              title={getResource('common.labelRunNow')}
              disabled={isRunNowDisabled}
              onPress={() => handleExecuteNow(scheduleType, scheduleState)}
            />
          </View>

          {runDisabledHint ? (
            <Text style={styles.infoText}>{runDisabledHint}</Text>
          ) : null}
          {scheduleState.error ? (
            <Text style={styles.errorText}>{scheduleState.error}</Text>
          ) : null}
          {scheduleState.isSaved && !scheduleState.isModified ? (
            <Text style={styles.successText}>
              {getResource('healthConnect.descriptionScheduleSaved')}
            </Text>
          ) : null}
        </View>
      );
    },
    [getResource, getRunDisabledHint, handleExecuteNow, isExecuting],
  );

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {renderScheduleCard(
          'HealthConnectExerciseDataExport',
          'healthConnect.captionScheduleExercise',
          exerciseSchedule,
        )}

        {renderScheduleCard(
          'HealthConnectHealthDataExport',
          'healthConnect.captionScheduleHealthData',
          healthDataSchedule,
        )}

        {executionFeedback ? (
          <Text
            style={
              executionFeedback.kind === 'success'
                ? styles.successText
                : styles.errorText
            }
          >
            {executionFeedback.message}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <ButtonComponent
          title={getResource('common.labelInitialize')}
          disabled={isExecuting}
          onPress={() => setIsInitializeModalVisible(true)}
        />
      </View>

      <HealthConnectInitialLoadModal
        visible={isInitializeModalVisible}
        isExecuting={isExecuting}
        initialLoadDays={initialLoadDays}
        loadExerciseSchedule={loadExerciseSchedule}
        loadHealthDataSchedule={loadHealthDataSchedule}
        canLoadInitialize={canLoadInitialize}
        onClose={() => setIsInitializeModalVisible(false)}
        onInitialLoadDaysChanged={handleInitialLoadDaysChanged}
        onLoadExerciseScheduleChanged={setLoadExerciseSchedule}
        onLoadHealthDataScheduleChanged={setLoadHealthDataSchedule}
        onLoad={handleInitialize}
        getResource={getResource}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentScrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    width: '100%',
    gap: 14,
    paddingBottom: 24,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colorMap.border,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    width: '100%',
    backgroundColor: colorMap.surface,
    shadowColor: colorMap.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colorMap.textPrimary,
  },
  cardCaption: {
    color: colorMap.textSecondary,
    fontSize: 13,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colorMap.textSecondary,
    flex: 1,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  errorText: {
    color: colorMap.error,
    textAlign: 'center',
    paddingVertical: 10,
  },
  successText: {
    color: colorMap.success,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 10,
  },
  infoText: {
    color: colorMap.info,
    textAlign: 'center',
    paddingVertical: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    paddingTop: 10,
    alignItems: 'flex-end',
    textAlign: 'center',
  },
});

export default withLocalNameSpaces('HealthConnectScheduleSettings', [
  'common',
  'healthConnect',
])(HealthConnectScheduleSettings);
