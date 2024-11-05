import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

const RegisterScreen = () => {
  const [name, setName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const router = useRouter();

  const validateFields = () => {
    let isValid = true;
    if (!name.value) {
      setName({ ...name, error: "Name is required" });
      isValid = false;
    }
    if (!email.value) {
      setEmail({ ...email, error: "Email is required" });
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      setEmail({ ...email, error: "Email format is invalid" });
      isValid = false;
    }
    if (!password.value) {
      setPassword({ ...password, error: "Password is required" });
      isValid = false;
    } else if (password.value.length < 6) {
      setPassword({
        ...password,
        error: "Password must be at least 6 characters",
      });
      isValid = false;
    }
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name.value,
          email: email.value,
          password: password.value,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        router.push("/login");
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again later.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/greeting")}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: "" })}
      />
      {name.error ? <Text style={styles.errorText}>{name.error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      {email.error ? <Text style={styles.errorText}>{email.error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        secureTextEntry
      />
      {password.error ? (
        <Text style={styles.errorText}>{password.error}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.text}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Login</Text>
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
  },
  backText: {
    color: "#333",
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
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
  errorText: {
    color: "#e74c3c",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#e3edaf",
    fontSize: 16,
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
});

export default memo(RegisterScreen);
