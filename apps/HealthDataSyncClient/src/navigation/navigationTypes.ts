import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  Dashboard: undefined;
  HealthConnect: undefined;
};

export const AppStackRoutes = {
  Dashboard: 'Dashboard',
  HealthConnect: 'HealthConnect',
} as const;

export type DashboardProps = NativeStackScreenProps<
  AppStackParamList,
  'Dashboard'
>;

export type HealthConnectProps = NativeStackScreenProps<
  AppStackParamList,
  'HealthConnect'
>;
