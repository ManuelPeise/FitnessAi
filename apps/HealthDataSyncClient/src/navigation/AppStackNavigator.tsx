import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HealthConnectDashboard from '../screens/dashboard/HealthConnectDashboard';
import { AppStackParamList, AppStackRoutes } from './navigationTypes';
import HealthConnectTabNavigator from './HealthConnectTabNavigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={AppStackRoutes.Dashboard}
        component={HealthConnectDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={AppStackRoutes.HealthConnect}
        component={HealthConnectTabNavigator}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default AppStackNavigator;
