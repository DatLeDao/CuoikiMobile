import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Button,
} from "react-native";
import axios from "axios";
import { ProgressBar, ActivityIndicator } from "react-native-paper";
import { useGlobalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
 import Loading from "@/components/Loading"; 

const StudyList = () => {
  const { vocabulary_list_id } = useGlobalSearchParams();   
  const { user } = useContext(AuthContext);                  
  const router = useRouter();                                

  const [listQuestions, setListQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState(false);


  useEffect(() => {
    if (vocabulary_list_id && user) {
      getQuestionsByVocabularyListId(vocabulary_list_id);
    }
  }, [vocabulary_list_id, user]);

  const getQuestionsByVocabularyListId = async (listId) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/getVocabularyLearnByUserId/${user.id}`,
        { list_id: listId }
      );
      setListQuestions(response.data); 
    } catch (error) {
      console.error("API Error:", error.message);
    }
  };

  if (!listQuestions || listQuestions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Đang tải câu hỏi...</Text>
      </View>
    );
  }

  const currentQuestion = listQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không có câu hỏi phù hợp.</Text>
        <Button title="Trở về" onPress={() => router.back()} />
      </View>
    );
  }

  const progress = currentQuestionIndex / listQuestions.length;

  const handleAnswer = async (answer) => {
    if (showAnswer) return;

    const isCorrect = answer === currentQuestion.answers_correct;

    setSelectedAnswer(answer);
    setIsCurrentAnswerCorrect(isCorrect);
    setCorrectCount((prev) => (isCorrect ? prev + 1 : prev));
    setIncorrectCount((prev) => (!isCorrect ? prev + 1 : prev));
    setShowAnswer(true);

    updateVocabularyProgress(user.id, currentQuestion.id, isCorrect);

    setTimeout(() => {
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCurrentAnswerCorrect(false);
      if (currentQuestionIndex < listQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    }, 2000);
  };


  const updateVocabularyProgress = async (user_id, vocabulary_id, isCorrect) => {
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


  const resetQuiz = () => {
    getQuestionsByVocabularyListId(vocabulary_list_id);
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsCompleted(false);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setIsCurrentAnswerCorrect(false);
  };


  if (isCompleted) {
    return (
      <View style={styles.center}>
        <Text style={styles.congratulations}>
          Chúc mừng! Bạn đã hoàn thành bài học 🎉
        </Text>
        <View style={styles.buttonContainer}>
          <Button title="Làm tiếp" onPress={() => resetQuiz()} />
          <Button title="Trở về" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Header title="Chế độ học" />
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <ProgressBar progress={progress} color="#6a11cb" style={styles.progressBar} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.question}>{currentQuestion.question}</Text>

          <View style={styles.answersContainer}>
            {currentQuestion.answers_wrong
              .concat(currentQuestion.answers_correct)
              .sort((a, b) => a.localeCompare(b)) 
              .map((answer, index) => {
                let answerStyle = styles.answer;
                if (showAnswer) {
                  if (answer === selectedAnswer) {
                    answerStyle = isCurrentAnswerCorrect
                      ? [styles.answer, styles.correctAnswer]
                      : [styles.answer, styles.incorrectAnswer];
                  } else if (
                    !isCurrentAnswerCorrect &&
                    answer === currentQuestion.answers_correct
                  ) {
                    answerStyle = [styles.answer, styles.correctAnswer];
                  }
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={answerStyle}
                    onPress={() => handleAnswer(answer)}
                    disabled={showAnswer} 
                  >
                    <Text style={styles.answerText}>{answer}</Text>
                  </TouchableOpacity>
                );
              })}
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Đúng: {correctCount}</Text>
            <Text style={styles.scoreText}>Sai: {incorrectCount}</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default StudyList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  answersContainer: {
    marginVertical: 20,
  },
  answer: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  answerText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  correctAnswer: {
    backgroundColor: "#4caf50",
    borderColor: "#388e3c",
  },
  incorrectAnswer: {
    backgroundColor: "#f44336",
    borderColor: "#d32f2f",
  },
  scoreContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
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
});
