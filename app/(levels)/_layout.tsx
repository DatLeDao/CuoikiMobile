import React from "react";
import { Stack } from "expo-router";

export default function LevelLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="levels" />
    </Stack>
  );
}
