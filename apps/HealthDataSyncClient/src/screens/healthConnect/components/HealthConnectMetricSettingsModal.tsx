import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import SwitchComponent from '../../../components/inputComponents/SwitchComponent';
import TextField from '../../../components/inputComponents/TextField';
import { ILocaleProps } from '../../../lib/localization';
import { HealthConnectMetricMappingTableEntry } from '../../../lib/database/databaseTypes';
import { colorMap } from '../../../lib/styles/colorMap';

type Props = Pick<ILocaleProps, 'getResource'> & {
  visible: boolean;
  metric: HealthConnectMetricMappingTableEntry | null;
  isIncludedInOrigin: boolean;
  onClose: () => void;
  onTargetChange: (target: string) => void;
  onToggleActive: () => void;
  onToggleIncluded: () => void;
};

const HealthConnectMetricSettingsModal: React.FC<Props> = ({
  visible,
  metric,
  isIncludedInOrigin,
  onClose,
  onTargetChange,
  onToggleActive,
  onToggleIncluded,
  getResource,
}) => {
  const insets = useSafeAreaInsets();

  if (!metric) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>{metric.source}</Text>

          <View style={styles.row}>
            <Text style={styles.labelText}>
              {getResource('common.labelActive')}
            </Text>
            <SwitchComponent
              checked={metric.isActive}
              onValueChange={onToggleActive}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.labelText}>
              {getResource('healthConnect.labelIncludedInOrigin')}
            </Text>
            <SwitchComponent
              checked={isIncludedInOrigin}
              disabled={!metric.isActive}
              onValueChange={onToggleIncluded}
            />
          </View>

          <TextField
            label={getResource('healthConnect.labelDisplayName')}
            value={metric.target}
            onChange={onTargetChange}
            placeholder={getResource(
              'healthConnect.placeholderEnterDisplayName',
            )}
          />

          <View style={styles.buttons}>
            <ButtonComponent
              title={getResource('common.labelClose')}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colorMap.overlay,
  },
  sheet: {
    minHeight: 370,
    padding: 20,
    backgroundColor: colorMap.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: colorMap.border,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: colorMap.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    color: colorMap.textSecondary,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
});

export default HealthConnectMetricSettingsModal;
