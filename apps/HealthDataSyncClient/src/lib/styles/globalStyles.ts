import { StyleSheet } from 'react-native';

import { colorMap } from './colorMap';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorMap.background,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  // Used by screens under the header-less HealthConnect tab navigator, which
  // need extra top spacing to avoid sitting flush against the status bar.
  healthConnectAreaContainer: {
    flex: 1,
    backgroundColor: colorMap.background,
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 14,
  },
});
