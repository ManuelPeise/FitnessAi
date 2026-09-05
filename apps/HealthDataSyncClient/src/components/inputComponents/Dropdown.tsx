import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colorMap } from '../../lib/styles/colorMap';

export type DropdownValue = string | number;

export type DropdownItem<TValue extends DropdownValue = DropdownValue> = {
  label: string;
  value: TValue;
};

interface IProps<TValue extends DropdownValue> {
  value: TValue;
  items: DropdownItem<TValue>[];
  disabled?: boolean;
  label?: string;
  onChange: (value: TValue) => void;
}

const Dropdown = <TValue extends DropdownValue>(props: IProps<TValue>) => {
  const { value, items, disabled, label, onChange } = props;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          dropdownIconColor={colorMap.textSecondary}
          selectedValue={value}
          enabled={!disabled}
          onValueChange={itemValue => onChange(itemValue as TValue)}
        >
          {items.map(item => (
            <Picker.Item
              key={String(item.value)}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    overflow: 'hidden',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    color: colorMap.textSecondary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colorMap.border,
    borderRadius: 10,
    backgroundColor: colorMap.backgroundAlt,
  },
  picker: {
    color: colorMap.textPrimary,
  },
});
export default Dropdown;
