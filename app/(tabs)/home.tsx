import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { LevelContext } from "@/context/LevelContext";
import { AuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { getCategoriesByLevelName } from "@/api/questions/categories";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import LottieView from 'lottie-react-native';
import Loading from "@/components/Loading";

import readingAnimation from '@/assets/lotties/reading.json';
import vocabularyAnimation from '@/assets/lotties/vocabulary.json';
import grammarAnimation from '@/assets/lotties/grammar.json';
import listeningAnimation from '@/assets/lotties/listening.json';

import defaultImage from '@/assets/images/images.png';

const window = Dimensions.get("window");

interface Category {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  image: string;
  title: string;
}

interface BannerItem {
  id: string;
  title: string;
  image: string;
}

const bannerData: BannerItem[] = [
  {
    id: "1",
    title: "Mẹo thi N3 lụi đâu trúng đó cùng ABC Sensei",
    image:
      "https://file.hstatic.net/1000302121/article/sach_tieng_nhat_100-min_b7a9e07df8b54e759057843c5600f80c_03a3ac1a6fd64891b6574fb482cf7943.png",
  },
  {
    id: "2",
    title: "Cập nhật mới nhất các bài luyện tập",
    image:
      "https://huongminh.edu.vn/wp-content/uploads/2024/08/web-dang-ky-jlpt-122024-840x430.png",
  },
  {
    id: "3",
    title: "Hoàn thiện kỹ năng của bạn",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlPQ8TPPhwVgtxFdzXigzeVu4mlrkg_GY4Kg&s",
  },
];

const practiceData = [
  { id: "1", name: "Lý thuyết", icon: "book-outline" },
  { id: "2", name: "Bạo đề", icon: "document-text-outline" },
  { id: "3", name: "Thi thử online", icon: "laptop-outline" },
  { id: "4", name: "Thi thử", icon: "clipboard-outline" },
];

const HomeScreen: React.FC = () => {
  const { selectedLevel } = useContext(LevelContext);
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState<number>(0);

  const lottieFiles: Record<string, any> = {
    reading: readingAnimation,
    vocabulary: vocabularyAnimation,
    grammar: grammarAnimation,
    listening: listeningAnimation,
  };

  useEffect(() => {
    if (selectedLevel) {
      fetchCategories(selectedLevel);
    } else {
      setLoading(true);
    }
  }, [selectedLevel]);

  const fetchCategories = async (levelName: string) => {
    try {
      const response = await getCategoriesByLevelName(levelName);
      const sortedCategories = response.data.sort(
        (a: Category, b: Category) => a.category_id - b.category_id
      );
      setCategories(sortedCategories);
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
      setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      Alert.alert("Lỗi", "Không thể tải danh mục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const renderBannerItem = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={() => router.push("/news")}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/mondai",
            params: {
              category_id: item.category_id,
              category_name: item.category_name,
            },
          })
        }
        activeOpacity={0.8}
        accessibilityLabel={`Chọn danh mục ${item.category_name}`}
        accessibilityHint={`Chọn danh mục ${item.category_name} để bắt đầu luyện tập`}
      >
        <View style={[styles.cardContainer, { backgroundColor: "#ffffff" }]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.category_name}</Text>
          </View>
        </View>

        <LottieView
          source={lottieFiles[item.icon]}
          autoPlay
          loop
          style={[
            styles.lottie,
            (item.icon === 'reading' || item.icon === 'grammar')
              ? { width: 180, height: 180, transform: [{ translateX: -90 }, { translateY: -50 }] }
              : { width: 90, height: 90, transform: [{ translateX: -45 }] }
          ]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPractice = ({ item }: { item: any }) => (
    <Animated.View
      entering={FadeInUp.delay(200)}
      style={styles.practiceWrapper}
    >
      <TouchableOpacity
        onPress={() => handlePracticeNavigation(item.id)}
        activeOpacity={0.8}
        style={styles.practiceItem}
      >
        <Ionicons
          name={item.icon}
          size={32}
          color={"#8cbf26"}
        />
        <Text style={styles.practiceText}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const handlePracticeNavigation = (practiceId: string) => {

  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Animated.View entering={FadeInDown} style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#D32F2F" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchCategories(selectedLevel);
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.headerContainer}>
          <View style={styles.userInfo}>
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : defaultImage
              }
              style={styles.userImage}
            />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Hello</Text>
              <Text style={styles.userName}>
                {user?.username || "Người dùng"}
              </Text>
            </View>
          </View>
          <View style={styles.header}>
            <Link href="/levels">
              <Text style={styles.headerText}>JLPT {selectedLevel}</Text>
            </Link>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown} style={styles.bannerSection}>
          <Carousel
            autoPlay
            autoPlayInterval={3000}
            data={bannerData}
            height={200}
            loop={true}
            pagingEnabled={true}
            snapEnabled={true}
            width={window.width - 40}
            onProgressChange={() => { }}
            onSnapToItem={(index) => setCurrentBanner(index)}
            renderItem={renderBannerItem}
          />
          <View style={styles.pagination}>
            {bannerData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentBanner === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Luyện tập</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.category_id.toString()}
            numColumns={2}
            renderItem={renderCategory}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.flatListContainer}
            scrollEnabled={false}
          />
        </Animated.View>


        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Luyện thi</Text>
          <FlatList
            data={practiceData}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderPractice}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.flatListContainer}
            scrollEnabled={false}
          />
        </Animated.View>


        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Tiến độ Bạo đề</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Ionicons
                name="stats-chart-outline"
                size={24}
                color={"#8cbf26"}
              />
              <Text style={styles.progressText}>Ngày 7: Bài kiểm tra</Text>
            </View>
            <View style={styles.testBadge}>
              <Text style={styles.testBadgeText}>Bài thi thử số 1</Text>
            </View>
            {/* Progress Bar */}
            <View style={styles.progressBarDetailed}>
              <View style={{
                width: '70%',
                height: '100%',
                backgroundColor: '#8cbf26',
                borderRadius: 4
              }} />
            </View>
            <Text style={styles.progressPercentage}>70% hoàn thành</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Đề xuất luyện tập</Text>
          <View style={styles.suggestContainer}>
            <View style={styles.suggestHeader}>
              <Ionicons
                name="bulb-outline"
                size={24}
                color={"#8cbf26"}
              />
              <Text style={styles.suggestText}>Nghe hiểu chủ đề</Text>
            </View>
            {/* Progress Bar */}
            <View style={styles.progressBarSuggest}>
              <View style={{
                width: '33%',
                height: '100%',
                backgroundColor: '#8cbf26',
                borderRadius: 5
              }} />
            </View>
            <Text style={styles.percentText}>33% hoàn thành</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 3,
    borderColor: "#8cbf26",
  },
  userText: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 15,
    color: "#555",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  header: {
    backgroundColor: "#8cbf26",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  bannerSection: {
    marginBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  bannerContainer: {
    position: "relative",
    borderRadius: 15,
    overflow: "hidden",
    width: window.width - 40,
    height: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 15,
  },
  bannerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    margin: 4,
  },
  activeDot: {
    backgroundColor: "#8cbf26",
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#333",
    marginBottom: 10,
    backgroundColor: "#e3edaf",
    borderRadius: 25,
    width: 150,
    textAlign: "center",
    padding: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  flatListContainer: {
    // Additional styles if needed
  },
  cardWrapper: {
    flex: 1,
    margin: 5,
    position: 'relative',
  },
  cardContainer: {
    height: 150,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    height: "100%",
    width: "100%",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    position: 'absolute',
    bottom: 20,
    width: "100%",
  },
  progressBar: {
    marginTop: 10,
    height: 6,
    borderRadius: 3,
    width: "100%",
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8cbf26",
  },
  lottie: {
    position: 'absolute',
    top: 0,
    left: '50%',
  },
  practiceWrapper: {
    flex: 1,
    margin: 5,
  },
  practiceItem: {
    height: 120,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  practiceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  progressContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    fontWeight: "600",
  },
  testBadge: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  testBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  progressBarDetailed: {
    marginTop: 10,
    height: 8,
    borderRadius: 4,
    width: "100%",
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  progressPercentage: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    textAlign: "right",
  },
  suggestContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  suggestText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginLeft: 10,
  },
  progressBarSuggest: {
    height: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  percentText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    alignSelf: "flex-end",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#e3edaf",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
  },
  retryButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#8cbf26",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
