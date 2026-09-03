import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HealthConnectOriginMapping from '../screens/healthConnect/HealthConnectOriginMapping';
import HealthConnectMetricMapping from '../screens/healthConnect/HealthConnectMetricMapping';
import HealthConnectScheduleSettings from '../screens/healthConnect/HealthConnectScheduleSettings';
import IconComponent from '../components/IconComponent';
import { colorMap } from '../lib/styles/colorMap';

export type MainTabParamList = {
  Origins: undefined;
  Metrics: undefined;
  ScheduleSettings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const HealthConnectTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colorMap.white,
          margin: 0,
          paddingVertical: 10,
        },
        tabBarActiveTintColor: colorMap.primary,
        tabBarInactiveTintColor: colorMap.disabled,
      }}
    >
      <Tab.Screen
        name="Origins"
        component={HealthConnectOriginMapping}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconComponent
              color={color}
              size={size}
              name="source"
              padding={0}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Metrics"
        component={HealthConnectMetricMapping}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconComponent
              color={color}
              size={size}
              name="dataset"
              padding={0}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleSettings"
        component={HealthConnectScheduleSettings}
        options={{
          tabBarLabel: 'Schedule',

          tabBarIcon: ({ color, size }) => (
            <IconComponent
              color={color}
              size={size}
              name="schedule"
              padding={0}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HealthConnectTabNavigator;
