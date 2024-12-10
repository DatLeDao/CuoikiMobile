import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LevelContext } from "@/context/LevelContext";
import { getLevels } from "@/api/questions/levels";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { User } from "@/types/user.type";

interface Level {
  level_id: number;
  level_name: string;
  description: string;
  image_url?: string;
}



const LevelSelectionScreen = () => {
  const { setSelectedLevel } = useContext(LevelContext);
  const [levels, setLevels] = useState<Level[]>([]);
  const { user } = useContext<{ user: User | null }>(AuthContext);
  const [loading, setLoading] = useState(true);

  const getLevelF = async () => {
    try {
      const response = await getLevels();
      setLevels(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching levels:", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getLevelF();
  }, []);

  const updateLevel = async (level: string) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/users/update-level/${user?.id}`,
        { level }
      );
    } catch (err :Error | unknown) {
      const error = err as Error;
      console.error("Error updating level:", error.message);
    }
  };

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    updateLevel(level);
    router.back();
  };

  const renderLevelItem = ({ item }: { item: Level }) => (
    <TouchableOpacity
      style={styles.levelItem}
      onPress={() => handleSelectLevel(item.level_name)}
      activeOpacity={0.7}
      accessibilityLabel={`Select level ${item.level_name}`}
      accessibilityHint={`Select ${item.level_name} level to proceed`}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.levelImage} />
      ) : (
        <AntDesign name="rocket1" size={30} color="#8cbf26" style={styles.levelIcon} />
      )}
      <View style={styles.levelInfo}>
        <Text style={styles.levelName}>{item.level_name}</Text>
        <Text style={styles.levelDescription}>{item.description}</Text>
      </View>
      <AntDesign name="arrowright" size={24} color="#8cbf26" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#8cbf26", "#e3edaf"]}
          style={styles.headerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.headerText}>Chọn Cấp Độ</Text>
        </LinearGradient>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" animating={loading} color="#8cbf26" />
          </View>
        ) : (
          <FlatList
            data={levels}
            renderItem={renderLevelItem}
            keyExtractor={(item) => item.level_id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e3edaf", 
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerContainer: {
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingBottom: 20,
  },
  levelItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginVertical: 8,
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelIcon: {
    marginRight: 15,
  },
  levelImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#f0f0f0",
  },
  levelInfo: {
    flex: 1,
    marginRight: 10,
  },
  levelName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  levelDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default LevelSelectionScreen;
