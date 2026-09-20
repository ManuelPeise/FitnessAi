import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LocalizationContextProvider from "./src/lib/localization/LocalizationContext";
import AuthenticationContextProvider from "./src/lib/authentication/AuthenticationContextProvider";
import ThemeContextProvider from "./src/lib/theme/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";
import "./src/lib/localization/i18n";

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeContextProvider>
        <LocalizationContextProvider>
          <AuthenticationContextProvider>
            <RootNavigator />
          </AuthenticationContextProvider>
        </LocalizationContextProvider>
      </ThemeContextProvider>
    </SafeAreaProvider>
  );
};

export default App;
