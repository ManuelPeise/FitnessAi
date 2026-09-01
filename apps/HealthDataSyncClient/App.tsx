import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthenticationProvider } from './src/components/contextProviders/AuthenticationContentProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';

const App: React.FC = () => {
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
