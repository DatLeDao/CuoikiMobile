import React, { memo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.push("/home");
      }
    };
    checkToken();
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.headerText}>Chào mừng đến với Ứng dụng Học Tiếng Nhật</Text>

      <Text style={styles.paragraphText}>
        Đăng nhập hoặc Đăng ký để bắt đầu hành trình học tập của bạn!
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e3edaf", 
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  paragraphText: {
    textAlign: "center",
    fontSize: 16,
    color: "#34495e",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#8e44ad", 
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});

export default memo(HomeScreen);
