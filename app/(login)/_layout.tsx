import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'ios',
        contentStyle: { backgroundColor: 'white' }
      }}
    >
      
      <Stack.Screen name="login" />
      <Stack.Screen name="greeting" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forget-password" />
    </Stack>
  );
}
