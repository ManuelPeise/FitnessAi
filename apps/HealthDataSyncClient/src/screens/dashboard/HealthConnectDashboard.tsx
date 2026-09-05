import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../../lib/styles/globalStyles';
import { colorMap } from '../../lib/styles/colorMap';
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
      <Text style={styles.title}>Health Connect Dashboard</Text>
      <TouchableOpacity onPress={goToSettings} style={styles.button}>
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colorMap.white,
    margin: 30,
  },
  button: {
    backgroundColor: colorMap.primary,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: colorMap.white,
  },
});

export default HealthConnectDashboard;
