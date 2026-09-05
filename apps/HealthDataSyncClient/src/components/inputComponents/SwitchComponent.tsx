import React from 'react';
import { Switch, View, StyleSheet } from 'react-native';

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
        thumbColor={checked ? '#2196F3' : '#f4f3f4'}
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
    marginVertical: 10,
  },
  switch: {
    marginRight: 10,
  },
});

export default SwitchComponent;
