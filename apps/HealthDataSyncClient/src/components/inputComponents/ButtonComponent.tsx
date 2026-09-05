import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { colorMap } from '../../lib/styles/colorMap';

interface IProps {
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
  minWidth?: number;

  onPress: () => void | Promise<void>;
}

const ButtonComponent: React.FC<IProps> = props => {
  const { title, onPress, disabled, isLoading, minWidth } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { minWidth: minWidth ?? 0 },
        disabled ? styles.disabledButton : styles.enabledButton,
      ]}
      disabled={disabled}
    >
      {!isLoading && <Text style={styles.buttonText}>{title}</Text>}
      {isLoading && <ActivityIndicator color={colorMap.primary} />}
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
