import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VocabularyLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: "black" },
          animation: "ios",
          contentStyle: { backgroundColor: "white" },
        }}
      >
        <Stack.Screen name="homelist" />
        <Stack.Screen name="studylist" />
        <Stack.Screen name="matchcard" />
      </Stack>
    </SafeAreaView>
  );
}
