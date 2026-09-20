import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomePage } from '../screens/HomePage';
import { useTheme } from '../hooks/useTheme';

export type AppTabParamList = {
  Home: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator(): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.palette.primary.main,
        tabBarInactiveTintColor: theme.palette.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.palette.background.paper,
          borderTopColor: theme.palette.divider,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomePage} />
    </Tab.Navigator>
  );
}
