import React from 'react';
import { Switch, View, StyleSheet } from 'react-native';
import { colorMap } from '../../lib/styles/colorMap';

interface IProps {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}

const SwitchComponent: React.FC<IProps> = props => {
  const { checked, onValueChange, disabled } = props;
  return (
    <View style={styles.container}>
      <Switch
        style={styles.switch}
        trackColor={{
          true: colorMap.primary,
          false: colorMap.disabled,
        }}
        thumbColor={checked ? colorMap.textPrimary : colorMap.textSecondary}
        value={checked}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  switch: {
    marginRight: 10,
  },
});

export default SwitchComponent;
