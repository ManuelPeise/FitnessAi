import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

const InitializationOverlay: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: theme.palette.background.default },
      ]}
    >
      <Image
        source={require("../../assets/FitnessAiLogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
  },
});

export default InitializationOverlay;
