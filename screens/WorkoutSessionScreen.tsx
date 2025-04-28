// WorkoutSessionScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const WorkoutSessionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Session</Text>
      <Text>Start your workout session here!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default WorkoutSessionScreen;
