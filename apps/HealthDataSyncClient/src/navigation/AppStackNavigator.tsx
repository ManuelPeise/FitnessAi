import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HealthConnectDashboard from '../screens/dashboard/HealthConnectDashboard';
import { AppStackParamList, AppStackRoutes } from './navigationTypes';
import HealthConnectTabNavigator from './HealthConnectTabNavigation';
import { getResource } from '../lib/localization';
import { colorMap } from '../lib/styles/colorMap';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colorMap.backgroundAlt,
        },
        headerTintColor: colorMap.textPrimary,
      }}
    >
      <Stack.Screen
        name={AppStackRoutes.Dashboard}
        component={HealthConnectDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={AppStackRoutes.HealthConnect}
        component={HealthConnectTabNavigator}
        options={{
          headerShown: true,
          title: getResource('common.captionHealthConnect'),
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStackNavigator;
