import React from "react";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);

  const getUserInfoByUserName = async () => {
    try {
      setLoading(true);
      const value = await AsyncStorage.getItem("username");
      if (value !== null) {
        const getUserInfo = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/users/username/${value}`
        );
        setUser(getUserInfo.data.data);
        setSelectedLevel(getUserInfo.data.data.level);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserInfoByUserName();
  }, []);


  return (
    <PaperProvider>
      <AuthContext.Provider value={{ user, setUser }}>
        <Stack>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(login)" />
        </Stack>
        <StatusBar barStyle="dark-content" />
      </AuthContext.Provider>
    </PaperProvider>
  );
}
