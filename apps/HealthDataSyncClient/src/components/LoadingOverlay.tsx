import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colorMap } from '../lib/styles/colorMap';
import { getResource } from '../lib/localization';

type IProps = {
  visible: boolean;
  label?: string;
};

const LoadingOverlay: React.FC<IProps> = ({ visible, label }) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <ActivityIndicator color={colorMap.primary} size="large" />
      <Text style={styles.label}>
        {label ?? getResource('common.labelLoading')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorMap.overlay,
  },
  label: {
    marginTop: 12,
    color: colorMap.textPrimary,
    fontWeight: '600',
  },
});

export default LoadingOverlay;
