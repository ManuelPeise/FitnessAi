import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colorMap } from '../../lib/styles/colorMap';

interface IProps {
  title: string;
  disabled?: boolean;
  onPress: () => void | Promise<void>;
}

const ButtonComponent: React.FC<IProps> = props => {
  const { title, onPress, disabled } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        disabled ? styles.disabledButton : styles.enabledButton,
      ]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enabledButton: {
    backgroundColor: colorMap.primary,
    shadowColor: colorMap.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: colorMap.disabled,
  },
  buttonText: {
    color: colorMap.textPrimary,
    fontWeight: '600',
  },
});
export default ButtonComponent;
