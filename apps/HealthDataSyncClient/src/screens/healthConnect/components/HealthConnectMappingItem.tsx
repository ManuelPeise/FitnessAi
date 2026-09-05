import React from 'react';
import { MappingTableEntry } from '../../../lib/database/databaseTypes';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import IconComponent from '../../../components/IconComponent';
import { colorMap } from '../../../lib/styles/colorMap';

type IProps = {
  mapping: MappingTableEntry;
  disabled?: boolean;
  onClick: () => void;
};

const HealthConnectMappingItem: React.FC<IProps> = props => {
  const { mapping, onClick, disabled } = props;

  const isInactiveOrUnmapped = !mapping.isActive || !mapping.target.length;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onClick}
      disabled={disabled}
    >
      <View style={styles.item}>
        <IconComponent
          name={isInactiveOrUnmapped ? 'error' : 'check-circle'}
          size="sm"
          color={isInactiveOrUnmapped ? colorMap.error : colorMap.success}
        />

        <Text style={styles.source}>{mapping.source}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  status: {
    marginRight: 10,
  },
  source: {
    flex: 1,
  },
  arrow: {
    marginHorizontal: 10,
  },
  target: {
    flex: 1,
  },
});

export default HealthConnectMappingItem;
