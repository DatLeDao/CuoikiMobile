import React from "react";
import {  Text, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import LottieView from "lottie-react-native";
import { styles } from "@/app/(practice)/styles/question.style";

const LoadingScreen: React.FC = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.loadingContainer}>
        {/* Loading effect using Lottie animation */}
        <LottieView
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require("@/assets/lotties/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LoadingScreen;
