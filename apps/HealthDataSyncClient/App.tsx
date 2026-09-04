import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthenticationProvider } from './src/components/contextProviders/AuthenticationContentProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { databaseAccessor } from './src/lib/database/database';
import { backgroundTaskService } from './src/lib/services/scheduler/backgroundTaskService';

const App: React.FC = () => {
  React.useEffect(() => {
    const initializeAsync = async () => {
      try {
        await databaseAccessor.initializeDatabase();
        await databaseAccessor.schedule.ensureSchedules();
      } catch (error) {
        console.error('Failed to initialize local database.', error);
      }

      try {
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
