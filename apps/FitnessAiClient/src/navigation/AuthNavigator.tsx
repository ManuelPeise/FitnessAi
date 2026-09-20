import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginPage } from '../screens/LoginPage';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
    </Stack.Navigator>
  );
}
