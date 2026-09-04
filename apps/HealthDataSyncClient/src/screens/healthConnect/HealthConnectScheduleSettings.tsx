import React from 'react';
import { useScheduleSettings } from '../../hooks/useScheduleSettings';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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

type ScheduleTab = {
  type: ScheduleSettingsType;
  label: string;
};

const scheduleTabs: ScheduleTab[] = [
  { type: 'HealthConnectExerciseDataExport', label: 'Exercise Data Export' },
  { type: 'HealthConnectHealthDataExport', label: 'Health Data Export' },
];

const HealthConnectScheduleSettings: React.FC = () => {
  const [type, setType] = React.useState<ScheduleSettingsType>(
    'HealthConnectExerciseDataExport',
  );

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
    handleResetSchedule,
    handleSaveSchedule,
    handleFrequencyChanged,
    handleScheduleChange,
  } = useScheduleSettings(type);

  const isWeekly = schedule?.frequency === 'weekly';
  const isHourly = schedule?.frequency === 'hourly';
  const isBusy = isLoading || isSaving;

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
          {isSaved && !isModified && (
            <Text style={styles.successText}>Schedule saved.</Text>
          )}

          <View style={styles.buttons}>
            {isSaving && <ActivityIndicator color={colorMap.primary} />}
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
    width: '50%',
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
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 15,
    marginTop: 25,
  },
});
export default HealthConnectScheduleSettings;
