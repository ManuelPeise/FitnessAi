import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import SwitchComponent from '../../../components/inputComponents/SwitchComponent';
import TextField from '../../../components/inputComponents/TextField';
import { MappingTableEntry } from '../../../lib/database/databaseTypes';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';
import { colorMap } from '../../../lib/styles/colorMap';
import { ILocaleProps } from '../../../lib/localization';

interface IProps extends Pick<ILocaleProps, 'getResource'> {
  visible: boolean;
  mapping: MappingTableEntry;
  onClose: () => void;
  onMappingChanged: (mapping: MappingTableEntry) => void;
}

const HealthConnectMappingModal: React.FC<IProps> = props => {
  const { visible, mapping, onClose, onMappingChanged, getResource } = props;

  const [selectedMapping, setSelectedMapping] =
    React.useState<MappingTableEntry>(mapping);

  React.useEffect(() => {
    setSelectedMapping(mapping);
  }, [mapping]);

  const handleMappingChanged = React.useCallback(
    (update: Partial<MappingTableEntry>) => {
      const updatedMapping = { ...selectedMapping, ...update };
      setSelectedMapping(updatedMapping);
    },
    [selectedMapping],
  );

  const isModified = React.useMemo((): boolean => {
    return (
      selectedMapping.isActive !== mapping.isActive ||
      selectedMapping.source !== mapping.source ||
      selectedMapping.target !== mapping.target
    );
  }, [selectedMapping, mapping]);

  const canSave = React.useMemo((): boolean => {
    return isModified && selectedMapping.target.length > 0;
  }, [isModified, selectedMapping.target]);
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

          {mapping && (
            <View>
              <View style={styles.row}>
                <Text style={styles.labelText}>
                  {getResource('common.labelActive')}
                </Text>
                <SwitchComponent
                  checked={selectedMapping.isActive}
                  onValueChange={checked =>
                    handleMappingChanged({ isActive: checked })
                  }
                />
              </View>

              <TextField
                label={getResource('healthConnect.labelSource')}
                value={selectedMapping.source}
                onChange={source => handleMappingChanged({ source })}
                placeholder={getResource('healthConnect.labelSource')}
              />

              <TextField
                label={getResource('healthConnect.labelTarget')}
                value={selectedMapping.target}
                onChange={target => handleMappingChanged({ target })}
                placeholder={getResource('healthConnect.labelTarget')}
              />
            </View>
          )}
          <View style={styles.buttons}>
            <ButtonComponent
              title={getResource('common.labelCancel')}
              onPress={onClose}
            />
            <ButtonComponent
              title={getResource('common.labelSave')}
              disabled={!canSave}
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
    shadowColor: colorMap.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
    marginBottom: 20,
  },
  labelText: {
    color: colorMap.textSecondary,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 30,
  },
});

export default HealthConnectMappingModal;
