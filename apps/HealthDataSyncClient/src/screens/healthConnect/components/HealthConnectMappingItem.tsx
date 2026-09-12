import React from 'react';
import { HealthConnectMappingTableEntry } from '../../../lib/database/databaseTypes';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import IconComponent from '../../../components/IconComponent';
import {
  colorMap,
  getMappingStatus,
  mappingStatusColorMap,
} from '../../../lib/styles/colorMap';

type IProps = {
  mapping: HealthConnectMappingTableEntry;
  disabled?: boolean;
  onClick: () => void;
};

const statusIconName: Record<
  ReturnType<typeof getMappingStatus>,
  'check-circle' | 'error' | 'remove-circle'
> = {
  active: 'check-circle',
  inactive: 'remove-circle',
  unmapped: 'error',
};

const HealthConnectMappingItem: React.FC<IProps> = props => {
  const { mapping, onClick, disabled } = props;

  const status = getMappingStatus(mapping);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onClick}
      disabled={disabled}
    >
      <View style={styles.item}>
        <IconComponent
          name={statusIconName[status]}
          size="sm"
          color={mappingStatusColorMap[status]}
        />

        <Text style={styles.source}>{mapping.source}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colorMap.backgroundAlt,
    borderWidth: 1,
    borderColor: colorMap.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  status: {
    marginRight: 10,
  },
  source: {
    flex: 1,
    color: colorMap.textPrimary,
  },
  arrow: {
    marginHorizontal: 10,
  },
  target: {
    flex: 1,
  },
});

export default HealthConnectMappingItem;
