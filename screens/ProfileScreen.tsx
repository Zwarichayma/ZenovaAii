// ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthScreen from './AuthScreen';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AuthScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});