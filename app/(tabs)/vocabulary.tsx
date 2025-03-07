import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Avatar,
  IconButton,
  Modal,
  Portal,
  Snackbar,
  useTheme,
} from "react-native-paper";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Loading from "@/components/Loading";

interface VocabularyList {
  id: string;
  name: string;
  wordsCount: number;
}

export default function SavedWordListsScreen() {
  const { user } = useContext(AuthContext);
  const [wordLists, setWordLists] = useState<VocabularyList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [valueEdit, setValueEdit] = useState<string>("");
  const router = useRouter();
  const theme = useTheme();
  const [error, setError] = useState<string>("");

  const getListVocabularyByUserId = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/${userId}`
      );
      setWordLists(response.data);
    } catch (error: any) {
      console.error("Error fetching vocabulary lists:", error.message);
      setError("Không thể tải danh sách từ vựng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getListVocabularyByUserId(user.id);
    }
  }, [user]);

  const createNewList = async () => {
    if (newListName.trim() === "") {
      alert("Vui lòng nhập tên danh sách");
      return;
    }
    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/${user.id}`,
        {
          name: newListName,
          user_id: user.id,
        }
      );
      getListVocabularyByUserId(user.id);
    } catch (error: any) {
      console.error("Error creating new list:", error.message);
      setError("Không thể tạo danh sách mới. Vui lòng thử lại.");
    } finally {
      setModalVisible(false);
      setNewListName("");
    }
  };

  const handleButtonPress = (id: string) => {
    router.push({
      pathname: "/homelist",
      params: { vocabulary_list_id: id },
    });
  };

  const renderItem = ({ item }: { item: VocabularyList }) => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleButtonPress(item.id)}
      >
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{`${item.wordsCount} từ`}</Text>
          </View>
          <Card.Actions style={styles.cardActions}>
            <IconButton
              icon="pencil-outline"
              size={20}
              onPress={
                () => {
                  setIsEditing(true);
                  setModalVisible(true);
                  setValueEdit(item.name);
                }
              }
              color={theme.colors.primary}
            />
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
     <Loading />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Avatar.Icon size={48} icon="book-outline" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Danh sách từ vựng đã lưu</Text>
      </Animated.View>

      <FlatList
        data={wordLists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View entering={FadeInDown} style={styles.createButtonWrapper}>
        <Button
          mode="contained"
          onPress={() => setModalVisible(true)}
          style={styles.createButton}
        >
          <Text style={{ color: "#000", fontSize: 16 ,fontWeight: "bold"}}>
            + Tạo danh sách
          </Text>
        </Button>
      </Animated.View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
          dismissable={false}
        >
          <Text style={styles.modalTitle}>Tạo danh sách mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên danh sách"
            value={isEditing ? valueEdit : newListName} 
            onChangeText={isEditing ? setValueEdit : setNewListName}
            placeholderTextColor="#999"
          />
          {/*<Button
            mode="contained"
            onPress={createNewList}
            style={styles.modalButton}
          >
            Tạo
          </Button>*/}
          <TouchableOpacity
            onPress={createNewList}
            style={styles.modalButton}
          >
            <Text style={{ color: "#000", fontSize: 16 }}>
              {isEditing ? "Cập nhật" : "Tạo"}
            </Text>
          </TouchableOpacity>
          <Button
            mode="text"
            onPress={() => setModalVisible(false)}
            style={styles.modalCancelButton}
          >
            Hủy
          </Button>
        </Modal>
      </Portal>

      {/* Snackbar Hiển thị lỗi */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        action={{
          label: "Đóng",
          onPress: () => {
            setError("");
          },
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#e3edaf", 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerIcon: {
    backgroundColor: "#c0d670",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  createButtonWrapper: {
    alignItems: "center",
    marginVertical: 20,
  },
  createButton: {
    width: "80%",
    backgroundColor: "#e3edaf",
    borderRadius: 30,
    
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
  },
  modalButton: {
    marginBottom: 10,
    borderRadius: 30,
    backgroundColor: "#e3edaf",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelButton: {
    alignSelf: "center",
    color: "#888",

  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  noListsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noListsText: {
    fontSize: 16,
    color: "#555",
  },
  
});
