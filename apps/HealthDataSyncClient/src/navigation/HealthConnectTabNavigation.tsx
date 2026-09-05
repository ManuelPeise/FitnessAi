import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HealthConnectOriginMapping from '../screens/healthConnect/HealthConnectOriginMapping';
import HealthConnectMetricMapping from '../screens/healthConnect/HealthConnectMetricMapping';
import HealthConnectScheduleSettings from '../screens/healthConnect/HealthConnectScheduleSettings';
import IconComponent from '../components/IconComponent';
import { colorMap } from '../lib/styles/colorMap';
import { getResource } from '../lib/localization';

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
          backgroundColor: colorMap.surface,
          margin: 0,
          paddingVertical: 10,
          borderTopColor: colorMap.border,
        },
        tabBarActiveTintColor: colorMap.primary,
        tabBarInactiveTintColor: colorMap.textMuted,
        tabBarLabelStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Origins"
        component={HealthConnectOriginMapping}
        options={{
          tabBarLabel: getResource('common.labelOrigins'),
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
          tabBarLabel: getResource('common.labelMetrics'),
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
          tabBarLabel: getResource('common.labelSchedule'),

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
