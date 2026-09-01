import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/test/HomeScreen';
import SyncScreen from '../screens/test/SyncScreen';
import SettingsScreen from '../screens/test/SettingsScreen';

export type MainTabParamList = {
  Home: undefined;
  Sync: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          marginBottom: 10,
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        // options={{
        //   tabBarIcon: ({ color, size }) => <></>,
        // }}
      />

      <Tab.Screen
        name="Sync"
        component={SyncScreen}
        // options={{
        //   tabBarIcon: ({ color, size }) => <></>,
        // }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        // options={{
        //   tabBarIcon: ({ color, size }) => <></>,
        // }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
