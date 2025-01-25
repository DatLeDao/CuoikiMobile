import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import FlashcardDeck from "./FlashcardDeck";
import { useGlobalSearchParams } from "expo-router";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Header from "@/components/Header";

export default function App() {
  const { vocabulary_list_id } = useGlobalSearchParams();
  const router = useRouter();

  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true); 

  const getVocabularies = async (vocabulary_list_id) => {
    try {
      setLoading(true); 
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/getVocabularyList/` +
          vocabulary_list_id
      );
      const data = response.data.map((item) => {
        return { id: item.id, front: item.name, back: item.definition };
      });
      setVocabularies(data);
    } catch (error) {
      console.error(error.message);
      Alert.alert("Lỗi", "Không thể tải dữ liệu từ vựng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    getVocabularies(vocabulary_list_id);
  }, [vocabulary_list_id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("@/assets/lotties/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <ActivityIndicator animating={true} size="large" color="#e3edaf" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {}
        {}

        <Header title="Bộ từ vựng" />

        <View style={styles.infoContainer}>
          <Text style={styles.subtitle}>
            Số lượng từ: {vocabularies.length}
          </Text>
        </View>

        {vocabularies.length > 0 ? (
          <>
            <FlashcardDeck vocabularies={vocabularies} />

            {}
            <View style={styles.buttonsContainer}>
              <Button
                mode="contained"
                style={styles.buttonPrimary}
                labelStyle={styles.buttonTextPrimary}
                onPress={() => {
                  router.push({
                    pathname: "/studylist",
                    params: { vocabulary_list_id },
                  });
                }}
              >
                <Ionicons
                  name="book"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                Thẻ ghi nhớ
              </Button>
              <Button
                mode="contained"
                style={styles.buttonPrimary}
                labelStyle={styles.buttonTextPrimary}
                onPress={() => {
                  router.push({
                    pathname: "/studylist",
                    params: { vocabulary_list_id },
                  });
                }}
              >
                <Ionicons
                  name="book"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                Học
              </Button>
              <Button
                mode="contained"
                style={styles.buttonPrimary}
                labelStyle={styles.buttonTextPrimary}
                onPress={() => {

                  router.push({
                    pathname: "/quiz",
                    params: { vocabulary_list_id },
                  });
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                Kiểm tra
              </Button>
              <Button
                mode="contained"
                style={styles.buttonPrimary}
                labelStyle={styles.buttonTextPrimary}
                onPress={() => {
                  router.push({
                    pathname: "/matchcard",
                    params: { vocabulary_list_id },
                  });
                }}
              >
                <Ionicons
                  name="shuffle"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                Ghép thẻ
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.noVocabContainer}>
            <LottieView
              source={require("@/assets/lotties/loading.json")}
              autoPlay
              loop
              style={styles.noDataAnimation}
            />
            <Ionicons name="sad-outline" size={100} color="#e3edaf" />
            <Text style={styles.noVocabText}>Không có từ vựng nào</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
  infoContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    gap: 12,
  },
  buttonPrimary: {
    marginVertical: 10,
    width: "48%",
    borderRadius: 12,
    height: 50,
    backgroundColor: "#e3edaf",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonTextPrimary: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 8,
    color: "#333",

  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#e3edaf",
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6a11cb", 
  },
  noVocabContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#e3edaf",
    borderRadius: 12,
    padding: 20,
  },
  noDataAnimation: {
    width: 150,
    height: 150,
  },
  noVocabText: {
    marginTop: 16,
    fontSize: 18,
    color: "#6a11cb",
    textAlign: "center",
  },
});