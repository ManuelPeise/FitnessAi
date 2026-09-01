import React from 'react';
import { useAuthenticationContext } from '../../../hooks/useAuthenticationContext';
import { Text, View } from 'react-native';

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthenticationContext();
  return (
    <View>
      <Text>Hello {isAuthenticated ? 'User' : 'Guest'}</Text>
    </View>
  );
};

export default AppNavigator;
