import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../lib/styles/globalStyles';
import {
  DashboardProps,
  AppStackRoutes,
} from '../../navigation/navigationTypes';

const HealthConnectDashboard: React.FC<DashboardProps> = props => {
  const { navigation } = props;

  const goToSettings = React.useCallback(() => {
    navigation.navigate(AppStackRoutes.HealthConnect);
  }, [navigation]);

  return (
    <View style={globalStyles.container}>
      <Text style={{ color: '#ffffff', margin: 30 }}>
        Health Connect Dashboard
      </Text>
      <TouchableOpacity
        onPress={goToSettings}
        style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}
      >
        <Text style={{ color: '#ffffff' }}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HealthConnectDashboard;
