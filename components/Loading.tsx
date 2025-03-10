// LoadingScreen.tsx
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const Loading = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require("@/assets/lotties/loading.json")} // Đảm bảo đường dẫn đúng
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <Text style={styles.loadingText}>Đang tải...</Text>
    </SafeAreaView>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  animationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
});
