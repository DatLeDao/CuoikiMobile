import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function LevelLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Stack
      screenOptions={{
       headerShown: false,
        headerStyle: { backgroundColor: 'black' },
        animation: 'ios',
        contentStyle: { backgroundColor: 'white' }
      }}
    >
      <Stack.Screen name="question" />
      <Stack.Screen name="mondai" />
      
    </Stack>
    </SafeAreaView>
  );
}
