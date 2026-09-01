import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthenticationContext } from '../hooks/useAuthenticationContext';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigation';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthenticationContext();

  if (isInitializing) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
