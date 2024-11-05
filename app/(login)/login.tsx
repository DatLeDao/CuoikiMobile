import React, { useContext, useEffect, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/AuthContext";

const LoginScreen = () => {
  const [username, setUsername] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Cảnh báo", "Bạn có chắc chắn muốn rời khỏi trang?", [
        {
          text: "Không",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  const handleLogin = async () => {
    if (!username.value || !password.value) {
      setSnackbar({
        visible: true,
        message: "Vui lòng nhập tên đăng nhập và mật khẩu",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/login`,
        {
          username: username.value,
          password: password.value,
        }
      );

      const { statusCode, message } = response.data;
      const tokenGet = response.data.data.token;
      const userName = response.data.data.username;

      if (statusCode === 200) {
        setUser({ ...user, token: tokenGet, username: userName });
        await AsyncStorage.setItem("token", tokenGet);
        await AsyncStorage.setItem("username", userName);

        const getUserInfo = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/users/username/${userName}`
        );
        setUser(getUserInfo.data.data);

        router.push("/home");
        setSnackbar({ visible: true, message: "Login successful!" });
      } else {
        setSnackbar({ visible: true, message });
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username.value}
        onChangeText={(text) => setUsername({ value: text, error: "" })}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator animating={true} size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forget-password")}>
        <Text style={styles.forgotText}>Forgot your password?</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.text}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e3edaf",
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#e3edaf",
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotText: {
    color: "#333",
    textAlign: "right",
    marginBottom: 24,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  text: {
    color: "#333",
  },
  link: {
    color: "#333",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  snackbar: {
    backgroundColor: "#333",
  },
});

export default LoginScreen;
