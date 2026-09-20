import React from "react";

import { View, ActivityIndicator, StyleSheet } from "react-native";

const LoadingIndicatorOverlay: React.FC = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default LoadingIndicatorOverlay;
