import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import SwitchComponent from '../../../components/inputComponents/SwitchComponent';
import TextField from '../../../components/inputComponents/TextField';
import { ILocaleProps } from '../../../lib/localization';
import { HealthConnectMappingTableEntry } from '../../../lib/database/databaseTypes';
import { colorMap } from '../../../lib/styles/colorMap';

type Props = Pick<ILocaleProps, 'getResource'> & {
  visible: boolean;
  mapping: HealthConnectMappingTableEntry;
  onClose: () => void;
  onMappingChanged: (mapping: HealthConnectMappingTableEntry) => void;
};

const HealthConnectMetricMappingModal: React.FC<Props> = ({
  visible,
  mapping,
  onClose,
  onMappingChanged,
  getResource,
}) => {
  const [selectedMapping, setSelectedMapping] = React.useState(mapping);

  React.useEffect(() => {
    setSelectedMapping(mapping);
  }, [mapping]);

  const updateMapping = React.useCallback(
    (update: Partial<HealthConnectMappingTableEntry>) => {
      setSelectedMapping(current => ({ ...current, ...update }));
    },
    [setSelectedMapping],
  );

  const isModified =
    selectedMapping.isActive !== mapping.isActive ||
    selectedMapping.target !== mapping.target;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>
            {getResource('healthConnect.captionEditMapping')}
          </Text>
          <View style={styles.row}>
            <Text style={styles.labelText}>
              {getResource('common.labelActive')}
            </Text>
            <SwitchComponent
              checked={selectedMapping.isActive}
              onValueChange={isActive => updateMapping({ isActive })}
            />
          </View>
          <TextField
            label={getResource('healthConnect.labelSource')}
            value={selectedMapping.source}
            disabled
            onChange={() => undefined}
          />
          <TextField
            label={getResource('healthConnect.labelTarget')}
            value={selectedMapping.target}
            onChange={target => updateMapping({ target })}
            placeholder={getResource('healthConnect.labelTarget')}
          />
          <View style={styles.buttons}>
            <ButtonComponent
              title={getResource('common.labelCancel')}
              onPress={onClose}
            />
            <ButtonComponent
              title={getResource('common.labelSave')}
              disabled={!isModified || selectedMapping.target.length === 0}
              onPress={() => {
                onMappingChanged(selectedMapping);
                onClose();
              }}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorMap.overlay,
  },
  dialog: {
    width: '95%',
    padding: 20,
    backgroundColor: colorMap.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorMap.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
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
    gap: 10,
    marginTop: 24,
  },
});

export default HealthConnectMetricMappingModal;
