import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  FlatList,
  Dimensions,
} from "react-native";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { useGlobalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Header from "@/components/Header";

const SCREEN_WIDTH = Dimensions.get("window").width;

const StudyList = () => {
  const { vocabulary_list_id } = useGlobalSearchParams();
  const { user } = useContext(AuthContext);
  const [listQuestions, setListQuestions] = useState([]);
  const [cards, setCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (vocabulary_list_id && user) {
      getQuestionsByVocabularyListId(vocabulary_list_id);
    }
  }, [vocabulary_list_id, user]);

  const getQuestionsByVocabularyListId = async (vocabulary_list_id) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/getVocabularyLearnByUserId/${user.id}`,
        { list_id: vocabulary_list_id }
      );
      setListQuestions(response.data);
      initializeCards(response.data);
    } catch (error) {
      console.error("API Error:", error.message);
    }
  };

  const initializeCards = (vocabList) => {
    const wordCards = vocabList.map((item) => ({
      id: item.id + "_word",
      text: item.question,
      pairId: item.id,
      type: "word",
    }));

    const meaningCards = vocabList.map((item) => ({
      id: item.id + "_meaning",
      text: item.answers_correct,
      pairId: item.id,
      type: "meaning",
    }));

    const combinedCards = [...wordCards, ...meaningCards];
    // Shuffle the cards
    const shuffledCards = shuffleArray(combinedCards);
    setCards(shuffledCards);
  };

  const shuffleArray = (array) => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;
    const newArray = [...array];
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      temporaryValue = newArray[currentIndex];
      newArray[currentIndex] = newArray[randomIndex];
      newArray[randomIndex] = temporaryValue;
    }
    return newArray;
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Đang tải dữ liệu người dùng...</Text>
      </View>
    );
  }

  if (!cards.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Đang tải thẻ...</Text>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <View style={styles.center}>
        <Text style={styles.congratulations}>
          Chúc mừng! Bạn đã hoàn thành bài học 🎉
        </Text>
        <View style={styles.buttonContainer}>
          <Button title="Chơi lại" onPress={() => resetGame()} />
          <Button title="Trở về" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const handleCardPress = (card) => {
    if (isProcessing) return;
    if (selectedCards.length === 0) {
      setSelectedCards([card]);
    } else if (selectedCards.length === 1) {
      if (selectedCards[0].id === card.id) {
        // Same card tapped twice
        return;
      }
      setSelectedCards([selectedCards[0], card]);
      setIsProcessing(true);

      if (
        selectedCards[0].pairId === card.pairId &&
        selectedCards[0].type !== card.type
      ) {
        // Match found
        setMatchedPairs((prev) => [...prev, selectedCards[0].pairId]);
        updateVocabularyProgress(user.id, card.pairId, true);

        setTimeout(() => {
          setSelectedCards([]);
          setIsProcessing(false);
          if (matchedPairs.length + 1 === listQuestions.length) {
            setIsCompleted(true);
          }
        }, 500);
      } else {
        updateVocabularyProgress(user.id, card.pairId, false);

        setTimeout(() => {
          setSelectedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const updateVocabularyProgress = async (
    user_id,
    vocabulary_id,
    isCorrect
  ) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/updateVocabularyProgress`,
        {
          user_id,
          vocabulary_id,
          isCorrect,
        }
      );
    } catch (error) {
      console.error("API Error:", error.message);
    }
  };

  const resetGame = () => {
    setMatchedPairs([]);
    setSelectedCards([]);
    setIsCompleted(false);
    initializeCards(listQuestions);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedCards.some((card) => card.id === item.id);
    const isMatched = matchedPairs.includes(item.pairId);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected ? styles.cardSelected : null,
          isMatched ? styles.cardMatched : null,
        ]}
        onPress={() => handleCardPress(item)}
        disabled={isMatched}
      >
        <Text style={styles.cardText} numberOfLines={3}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Học từ vựng qua ghép thẻ" />
      <FlatList
        data={cards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

export default StudyList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  congratulations: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#4caf50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  grid: {
    padding: 10,
    justifyContent: "center",
  },
  card: {
    width: (SCREEN_WIDTH - 40) / 3,
    height: (SCREEN_WIDTH - 40) / 3,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardSelected: {
    borderColor: "#6a11cb",
    borderWidth: 2,
  },
  cardMatched: {
    backgroundColor: "#d3ffd3",
    borderColor: "#4caf50",
  },
  cardText: {
    fontSize: 16,
    textAlign: "center",
  },
});
