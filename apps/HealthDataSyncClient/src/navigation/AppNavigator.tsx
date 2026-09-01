import React from 'react';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { Text, View } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen';

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthenticationContext();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Hello {isAuthenticated ? 'User' : 'Guest'}</Text>
    </View>
  );
};

export default AppNavigator;
