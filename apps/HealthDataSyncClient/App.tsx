import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthenticationProvider } from './src/components/contextProviders/AuthenticationContentProvider';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <AuthenticationProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </AuthenticationProvider>
  );
};

export default App;
