import React from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { View } from 'react-native';
import LocalizationContextProvider from './src/lib/localization/LocalizationContext';
import './src/lib/localization/i18n';

const AppContent: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* App content */}
    </View>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <LocalizationContextProvider>
        <AppContent />
      </LocalizationContextProvider>
    </SafeAreaProvider>
  );
};

export default App;
