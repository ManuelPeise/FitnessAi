import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import TextField from '../../../components/inputComponents/TextField';
import { ILocaleProps } from '../../../lib/localization';
import { colorMap } from '../../../lib/styles/colorMap';

interface IProps extends Pick<ILocaleProps, 'getResource'> {
  visible: boolean;
  isExecuting: boolean;
  initialLoadDays: string;
  canLoadInitialize: boolean;
  onClose: () => void;
  onInitialLoadDaysChanged: (value: string) => void;
  onLoad: () => void;
}

const HealthConnectInitialLoadModal: React.FC<IProps> = props => {
  const {
    visible,
    isExecuting,
    initialLoadDays,
    canLoadInitialize,
    onClose,
    onInitialLoadDaysChanged,
    onLoad,
    getResource,
  } = props;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.sectionTitle}>
            {getResource('common.labelPushOnDemand')}
          </Text>

          <TextField
            label={getResource('healthConnect.labelInitialLoadDays')}
            value={initialLoadDays}
            placeholder={getResource('healthConnect.labelInitialLoadDays')}
            keyboardType="number-pad"
            textAlign="right"
            maxLength={3}
            onChange={onInitialLoadDaysChanged}
            disabled={isExecuting}
          />

          <View style={styles.actionButtonsRow}>
            <ButtonComponent
              title={getResource('common.labelCancel')}
              onPress={onClose}
              disabled={isExecuting}
            />
            <ButtonComponent
              title={getResource('common.labelPush')}
              onPress={onLoad}
              isLoading={isExecuting}
              disabled={!canLoadInitialize}
              minWidth={80}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorMap.overlay,
    paddingHorizontal: 12,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colorMap.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorMap.border,
    padding: 16,
    gap: 10,
    shadowColor: colorMap.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colorMap.textPrimary,
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
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
});

export default HealthConnectInitialLoadModal;
