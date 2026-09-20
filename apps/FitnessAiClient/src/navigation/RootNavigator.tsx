import React from "react";
import { NavigationContainer, Theme as NavigationTheme } from "@react-navigation/native";
import useAuthentication from "../hooks/useAuthentication";
import { useTheme } from "../hooks/useTheme";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import InitializationOverlay from "../components/overlays/InitializationOverlay";

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthentication();
  const { theme } = useTheme();

  if (isInitializing) {
    return <InitializationOverlay />;
  }

  const navigationTheme: NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.palette.primary.main,
      background: theme.palette.background.default,
      card: theme.palette.background.paper,
      text: theme.palette.text.primary,
      border: theme.palette.divider,
      notification: theme.palette.error.main,
    },
    fonts: {
      regular: { fontFamily: theme.typography.fontFamily, fontWeight: "400" },
      medium: { fontFamily: theme.typography.fontFamily, fontWeight: "500" },
      bold: { fontFamily: theme.typography.fontFamily, fontWeight: "700" },
      heavy: { fontFamily: theme.typography.fontFamily, fontWeight: "900" },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
