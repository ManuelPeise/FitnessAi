import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import SwitchComponent from '../../../components/inputComponents/SwitchComponent';
import TextField from '../../../components/inputComponents/TextField';
import { MappingTableEntry } from '../../../lib/database/databaseTypes';
import ButtonComponent from '../../../components/inputComponents/ButtonComponent';

interface IProps {
  visible: boolean;
  mapping: MappingTableEntry;
  onClose: () => void;
  onMappingChanged: (mapping: MappingTableEntry) => void;
}

const HealthConnectMappingModal: React.FC<IProps> = props => {
  const { visible, mapping, onClose, onMappingChanged } = props;

  const [selectedMapping, setSelectedMapping] =
    React.useState<MappingTableEntry>(mapping);

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
          <Text style={styles.title}>Edit Mapping</Text>

          {mapping && (
            <View>
              <View style={styles.row}>
                <Text>Active</Text>
                <SwitchComponent
                  checked={selectedMapping.isActive}
                  onValueChange={checked =>
                    handleMappingChanged({ isActive: checked })
                  }
                />
              </View>

              <TextField
                value={selectedMapping.source}
                onChange={source => handleMappingChanged({ source })}
                placeholder="Source"
              />

              <TextField
                value={selectedMapping.target}
                onChange={target => handleMappingChanged({ target })}
                placeholder="Target"
              />
            </View>
          )}
          <View style={styles.buttons}>
            <ButtonComponent title="Cancel" onPress={onClose} />
            <ButtonComponent
              title="Save"
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    width: '95%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 30,
  },
});

export default HealthConnectMappingModal;
