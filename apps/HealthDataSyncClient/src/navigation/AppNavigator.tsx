import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthenticationContext } from '../hooks/useAuthenticationContext';

import AuthNavigator from './AuthNavigator';
import AppStackNavigator from './AppStackNavigator';
import { HealthConnectProvider } from '../components/contextProviders/HealthConnectContextProvider';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthenticationContext();

  if (isInitializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <HealthConnectProvider>
        {isAuthenticated ? <AppStackNavigator /> : <AuthNavigator />}
      </HealthConnectProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;
