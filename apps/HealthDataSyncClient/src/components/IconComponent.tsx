import React from 'react';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { StyleSheet, View } from 'react-native';

type IconSize = 'sm' | 'md' | 'lg';
type IconType =
  | 'check-circle'
  | 'error'
  | 'info'
  | 'warning'
  | 'source'
  | 'dataset'
  | 'schedule';

interface IconComponentProps {
  name: IconType;
  size: IconSize | number;
  color?: string;
  padding?: number;
}

const IconComponent: React.FC<IconComponentProps> = props => {
  const { name, size, color = 'black', padding = 10 } = props;

  return (
    <View style={[styles.container, { padding }]}>
      <MaterialIcons
        name={name}
        size={
          size === 'sm'
            ? 16
            : size === 'md'
            ? 24
            : size === 'lg'
            ? 32
            : typeof size === 'number'
            ? size
            : 24
        }
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default IconComponent;
