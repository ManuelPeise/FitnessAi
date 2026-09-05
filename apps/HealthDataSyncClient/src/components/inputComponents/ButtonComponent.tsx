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
        { backgroundColor: disabled ? colorMap.disabled : colorMap.primary },
      ]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: colorMap.white,
  },
});
export default ButtonComponent;
