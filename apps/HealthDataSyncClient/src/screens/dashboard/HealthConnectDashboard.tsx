import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../lib/styles/globalStyles';
import { colorMap } from '../../lib/styles/colorMap';
import {
  DashboardProps,
  AppStackRoutes,
} from '../../navigation/navigationTypes';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import ButtonComponent from '../../components/inputComponents/ButtonComponent';
import { ILocaleProps, withLocalNameSpaces } from '../../lib/localization';

type Props = DashboardProps & ILocaleProps;

const HealthConnectDashboard: React.FC<Props> = props => {
  const { getResource } = props;
  const { navigation } = props;
  const { currentUserId } = useAuthenticationContext();
  const goToSettings = React.useCallback(() => {
    navigation.navigate(AppStackRoutes.HealthConnect);
  }, [navigation]);

  return (
    <View style={globalStyles.container}>
      <Text style={styles.title}>
        {getResource('common.captionHealthConnectDashboard')}
      </Text>
      <View style={styles.buttonContainer}>
        <ButtonComponent
          title={getResource('common.labelGoToSettings')}
          onPress={goToSettings}
        />
      </View>
      <View style={styles.userContainer}>
        <Text style={styles.userIdText}>
          {getResource('common.labelCurrentUserId')}: {currentUserId}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colorMap.textPrimary,
    marginBottom: 20,
    fontSize: 22,
    fontWeight: '700',
  },
  buttonContainer: {
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  userContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colorMap.surface,
    borderWidth: 1,
    borderColor: colorMap.border,
  },
  userIdText: {
    color: colorMap.textSecondary,
  },
});

export default withLocalNameSpaces('HealthConnectDashboard', ['common'])(
  HealthConnectDashboard,
);
