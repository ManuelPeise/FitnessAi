import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../hooks/useTheme";
import useAuthentication from "../hooks/useAuthentication";

export function HomePage(): React.JSX.Element {
  const { theme } = useTheme();
  const auth = useAuthentication();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.palette.background.default },
      ]}
    >
      <Text style={[styles.title, { color: theme.palette.text.primary }]}>
        Dashboard
      </Text>
      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: theme.palette.primary.main,
          borderRadius: 5,
        }}
        onPress={() => {
          auth.logout();
        }}
      >
        <Text style={{ color: theme.palette.primary.contrastText }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600" },
});
