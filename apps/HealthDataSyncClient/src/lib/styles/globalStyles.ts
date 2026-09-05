import { StyleSheet } from 'react-native';

import { colorMap } from './colorMap';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorMap.background,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
});
