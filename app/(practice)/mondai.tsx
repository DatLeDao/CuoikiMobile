import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { LevelContext } from "@/context/LevelContext";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

type Subsection = {
  id: number;
  subsection_id: string;
  subsection_name: string;
};

const MondaiScreen = () => {
  const [mondais, setMondais] = useState<Subsection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedLevel } = useContext(LevelContext);
  const router = useRouter();
  const { category_id, category_name } = useGlobalSearchParams();

  useEffect(() => {
    fetchData();
  }, [selectedLevel]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/questions/mondaisByCategory/${category_id}`
      );
      const sortedMondais = response.data.sort(
        (a: Subsection, b: Subsection) =>
          parseInt(a.subsection_id) - parseInt(b.subsection_id)
      );
      setMondais(sortedMondais);
    } catch (err: any) {
      console.error("Error fetching data:", err.message);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.";
      setError(errorMessage);
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMondaiPress = (id: string) => {
    router.push({
      pathname: "/mondai-detail",
      params: { subsection_id: id },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e3edaf" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchData();
          }}
          accessibilityLabel="Retry Button"
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e3edaf", "#cce0a8"]}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <AntDesign
            name="arrowleft"
            size={28}
            color="#333"
            onPress={() => router.back()}
            accessibilityLabel="Back Button"
          />
          <Text style={styles.headerText}>{category_name || "Chuyên mục"}</Text>
          <AntDesign name="book" size={28} color="#333" />
        </View>
        <Text style={styles.headerSubText}>Level: {selectedLevel}</Text>
      </LinearGradient>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Số mondai: <Text style={styles.summaryValue}>{mondais.length}</Text>
          </Text>
        </View>
      </View>

      <FlatList
        data={mondais}
        renderItem={({ item }) => (
          <View style={styles.mondaiWrapper}>
            <TouchableOpacity
              onPress={() => handleMondaiPress(item.subsection_id)}
              style={styles.mondaiItem}
              activeOpacity={0.7}
              accessibilityLabel={`Mondai ${item.subsection_name}`}
            >
              <AntDesign
                name="book"
                size={24}
                color="#8cbf26"
                style={styles.mondaiIcon}
              />
              <Text style={styles.mondaiName}>{item.subsection_name}</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) =>
          item.id ? item.id.toString() : `${item.subsection_id}`
        }
        contentContainerStyle={styles.mondaiList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có dữ liệu nào.</Text>
          </View>
        }
      />

      <View style={styles.footerButtonContainer}>
        <TouchableOpacity activeOpacity={0.7} style={styles.footerButton}>
          <LinearGradient
            colors={["#b5e48c", "#e3edaf"]}
            style={styles.gradient}
          >
            <Text style={styles.footerButtonText}>Luyện tập câu sai</Text>
            <Text style={styles.footerButtonCount}>Số câu hỏi: 10 câu</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3edaf",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6a6a6a",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e3edaf",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8cbf26",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#333",
    fontSize: 16,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerSubText: {
    color: "#555",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  summaryContainer: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontWeight: "bold",
    color: "#8cbf26",
  },
  mondaiList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mondaiWrapper: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
    borderColor: "#e3edaf",
    
  },
  mondaiItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },
  mondaiIcon: {
    marginRight: 10,
  },
  mondaiName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8cbf26",
    flex: 1,
  },
  footerButtonContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  footerButton: {
    width: "90%",
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  footerButtonCount: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
  },
});

export default MondaiScreen;
