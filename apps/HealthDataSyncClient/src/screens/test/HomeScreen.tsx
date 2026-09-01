import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles as globalStyles } from '../../lib/styles/globalStyles';

const HomeScreen: React.FC = () => {
  return (
    <View style={globalStyles.container}>
      <Text style={{ color: '#ffffff' }}>Home</Text>
    </View>
  );
};

export default HomeScreen;
