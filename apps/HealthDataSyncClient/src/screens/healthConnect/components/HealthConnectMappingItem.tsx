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
