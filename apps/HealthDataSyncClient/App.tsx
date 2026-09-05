import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthenticationProvider } from './src/components/contextProviders/AuthenticationContentProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { databaseAccessor } from './src/lib/database/database';

const App: React.FC = () => {
  React.useEffect(() => {
    databaseAccessor.initializeDatabase().catch(error => {
      console.error('Failed to initialize local database.', error);
    });
  }, []);

  return (
    <AuthenticationProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </AuthenticationProvider>
  );
};

export default App;
