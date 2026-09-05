import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthenticationProvider } from './src/components/contextProviders/AuthenticationContentProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { backgroundTaskService } from './src/lib/services/scheduler/backgroundTaskService';
import { databaseAccessor } from './src/lib/database/database';

const App: React.FC = () => {
  React.useEffect(() => {
    const initializeAsync = async () => {
      try {
        await databaseAccessor.initializeDatabase();
        await backgroundTaskService.initialize();
      } catch (error) {
        console.error('Failed to initialize background task service.', error);
      }
    };

    initializeAsync();
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
