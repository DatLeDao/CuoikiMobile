import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useContext,
  } from "react";
  import {
    View,
    Alert,
    SafeAreaView,
    FlatList,
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
  import axios from "axios";
  import { useGlobalSearchParams, useRouter } from "expo-router";
  import { Audio } from "expo-av";
  import { LogBox } from "react-native";
  import { AuthContext } from "@/context/AuthContext";
  import { Modal, Snackbar
  } from "react-native-paper";
  import { useWindowDimensions } from "react-native";
  import { styles } from "./styles/question.style";
  
  import Header from "@/components/practice/questions/Header";
  import QuestionItem from "@/components/practice/questions/QuestionItem";
  import LoadingScreen from "@/components/practice/questions/Loading";
  import ErrorScreen from "@/components/practice/questions/ErrorScreen";
import GetInfoVocab from "./(component)/question/GetInfoVocab";
  
 
  
  const { width } = Dimensions.get("window");
    
  const removeHTMLTags = (text: string) => {
    return text.replace(/<[^>]+>/g, "");
  };
  
  const tokenizeText = async (text: string) => {
    text = text.replace(/<p>/g, "").replace(/<\/p>/g, "");
  
    const regex = /<u>(.*?)<\/u>/g;
   
    const matches = text.match(regex);
    
    const text2 = matches
      ? matches[0].replace(/<u>/g, "").replace(/<\/u>/g, "")
      : "";
    const plainText = removeHTMLTags(text);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/vocabularyAnalysis/123`,
        {
          text: plainText,
        }
      );
      if (response.data && response.data.status === 200) {
        const tokens = response.data.data.map((item: string) => {
          const [word, ...rest] = item.split("\t");
          return { word, details: rest.join("\t") };
        });
        return {
          tokens,
          textUnderline: text2,
        };
      } else {
        console.error("Tokenizer API returned an error:", response.data);
        return { tokens: [], textUnderline: "" };
      }
    } catch (error) {
      console.error("Error calling tokenizer API:", error);
      return { tokens: [], textUnderline: "" };
    }
  };
  
  const QuestionScreen = () => {
    const { num_questions, subsection_id } = useGlobalSearchParams();
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const animation = useRef(new Animated.Value(1)).current;
  
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [currentExplanation, setCurrentExplanation] = useState("");
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingExplanation, setLoadingExplanation] = useState(false);
  
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
  
    const [isVocabModalVisible, setVocabModalVisible] = useState(false);
    const [selectedWord, setSelectedWord] = useState("");
    const [vocabInput, setVocabInput] = useState("");
  
    const [infoVocabCurrent, setInfoVocabCurrent] = useState<any>(null);
    const [vocabExample, setVocabExample] = useState<any[]>([]);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const windowWidth = useWindowDimensions().width;
    const [wordLists, setWordLists] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [isVisibleDiscuss, setIsVisibleDiscuss] = useState(false);
  
    const getListVocabularyByUserId = async (userId: string) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/${userId}`
        );
        setWordLists(response.data);
      } catch (error: any) {
        console.error("Error fetching vocabulary lists:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (user?.id) {
        getListVocabularyByUserId(user.id);
      }
    }, [user]);
  
    const allQuestionsAnswered = (selectedAnswersState: { [key: number]: number }) => {
      return questions.every(
        (_, index) => selectedAnswersState[index] != null
      );
    };
  
    const findFirstUnanswered = (selectedAnswersState: { [key: number]: number }) => {
      return questions.findIndex(
        (_, index) => selectedAnswersState[index] == null
      );
    };
  
    const fetchQuestions = async () => {
      try {
        setLoading(true); // Added loading state here
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/questions/getQuestionsByMondaiId/${subsection_id}`,
          { user_id: user.id, quantity: num_questions }
        );
  
        const fetchedQuestions = response.data;
  
        const processedQuestions = await Promise.all(
          fetchedQuestions.map(async (question: any) => {
            let parsedAnswers = [];
            let correctAnswerIndex = -1;
  
            try {
              parsedAnswers = JSON.parse(question.answers);
              correctAnswerIndex = parsedAnswers.findIndex(
                (answer: any) => answer.is_correct === 1
              );
            } catch (parseError) {
              console.error(
                `Error parsing answers for question ${question.question_id}:`,
                parseError
              );
            }
  
            const tokens = await tokenizeText(question.question_text);
  
            return {
              ...question,
              parsedAnswers,
              correctAnswerIndex,
              tokens,
            };
          })
        );
  
        setQuestions(processedQuestions);
        setCurrentIndex(0); // Reset to first question after fetching
      } catch (err: any) {
        console.error(err.message);
        setError(
          "Đã xảy ra lỗi khi tải dữ liệu câu hỏi. Vui lòng thử lại sau."
        );
        Alert.alert(
          "Lỗi",
          "Đã xảy ra lỗi khi tải dữ liệu câu hỏi. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };
  
    const updateUserProgress = async (user_id: string, question_id: number, is_correct: boolean) => {
      try {
        await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/questions/updateUserQuestionProgress`,
          {
            user_id,
            question_id,
            is_correct,
          }
        );
      } catch (error: any) {
        console.error("Error updating user progress:", error);
      }
    };
  
    useEffect(() => {
      if (subsection_id && user && num_questions) {
        fetchQuestions();
      }
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [subsection_id, user, num_questions]);
  
    useEffect(() => {
      if (questions.length > 0) {
        const currentQuestion = questions[currentIndex];
        if (currentQuestion.audio_path) {
          playSound(currentQuestion.audio_path);
        } else {
          if (sound) {
            sound.unloadAsync();
            setSound(null);
            setIsPlaying(false);
            setAudioProgress(0);
            setAudioDuration(0);
          }
        }
      }
    }, [currentIndex, questions]);
  
    const handleAnswerSelect = (answerIndex: number) => {
      if (selectedAnswers[currentIndex] != null) {
        return;
      }
  
      const correctIndex = questions[currentIndex].correctAnswerIndex;
      const is_correct = answerIndex === correctIndex;
  
      const newSelectedAnswers = {
        ...selectedAnswers,
        [currentIndex]: answerIndex,
      };
  
      setSelectedAnswers(newSelectedAnswers);
  
      updateUserProgress(
        user.id,
        questions[currentIndex].question_id,
        is_correct
      );
  
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
  
      setTimeout(() => {
        const allAnswered = allQuestionsAnswered(newSelectedAnswers);
        if (allAnswered) {
          setModalVisible(true);
        } else {
          const nextIndex = findFirstUnanswered(newSelectedAnswers);
          if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }
        }
      }, 1500);
    };
  
    const generateExplanation = async (question: any) => {
      try {
        setLoadingExplanation(true);
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/fetchVocabInfo/generateExplanation`,
          {
            question: question,
          }
        );
        if (response.data) {
          setCurrentExplanation(response.data);
          setModalVisible(true);
        }
      } catch (error: any) {
        console.error("Error generating explanation:", error.message);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo giải thích.");
      } finally {
        setLoadingExplanation(false);
      }
    };
  
    const playSound = async (audioUri: string) => {
      try {
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
          setAudioProgress(0);
          setAudioDuration(0);
        }
  
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (error: any) {
        console.error("Error playing sound:", error);
        Alert.alert("Lỗi", "Không thể phát âm thanh.");
      }
    };
  
    const onPlaybackStatusUpdate = (status: any) => {
      if (status.isLoaded) {
        if (status.isPlaying) {
          setAudioProgress(status.positionMillis / 1000);
          setAudioDuration(status.durationMillis / 1000);
        }
        if (status.didJustFinish) {
          setIsPlaying(false);
          if (sound) {
            sound.unloadAsync();
            setSound(null);
            setAudioProgress(0);
            setAudioDuration(0);
          }
        }
      } else {
        if (status.error) {
          console.error(`Playback error: ${status.error}`);
          Alert.alert("Lỗi", "Đã xảy ra lỗi khi phát âm thanh.");
        }
      }
    };
  
    const togglePlayback = async () => {
      if (isPlaying) {
        if (sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
      } else {
        if (sound) {
          await sound.playAsync();
          setIsPlaying(true);
        } else if (questions.length > 0 && questions[currentIndex].audio_path) {
          await playSound(questions[currentIndex].audio_path);
        }
      }
    };
  
    const handleSliderChange = async (value: number) => {
      if (sound && sound.isLoaded) {
        const seekPosition = value * 1000;
        await sound.setPositionAsync(seekPosition);
        setAudioProgress(value);
      }
    };
  
    const fetchVocabInfo = async (word: string) => {
      setModalLoading(true);
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/fetchVocabInfo/123`,
          {
            query: word,
            type: "word",
          }
        );
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const vocabInfo = response.data;
          setInfoVocabCurrent(vocabInfo);
        } else {
          setInfoVocabCurrent(null);
        }
        fetchVocabExample(word);
      } catch (error: any) {
        console.error("Error fetching vocabulary info:", error.message);
      } finally {
        setModalLoading(false);
      }
    };
  
    const fetchVocabExample = async (word: string) => {
      setModalLoading(true);
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/fetchVocabInfo/123`,
          {
            query: word,
            type: "example",
            dict: "javi",
          }
        );
        if (response.data && response.data.results) {
          const vocabInfo = response.data.results;
          setVocabExample(vocabInfo);
        } else {
          setVocabExample([]);
        }
      } catch (error: any) {
        console.error("Error fetching vocabulary examples:", error.message);
      } finally {
        setModalLoading(false);
      }
    };
  
    const handleWordPress = (word: string) => {
      if (word.trim() !== "") {
        setSelectedWord(word);
        fetchVocabInfo(word);
        setVocabModalVisible(true);
      }
    };
  
    const addWordToVocabList = async (listId: string) => {
      if (listId) {
        try {
          await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/getMeaningAndAddVocabToUserList/123`,
            {
              name: selectedWord,
              list_id: listId,
            }
          );
          setSnackbarMessage("Đã thêm từ vựng vào danh sách!");
          setSnackbarVisible(true);
        } catch (error: any) {
          console.error("Error adding word to vocabulary list:", error.message);
        }
      }
    };
  
    // Confirmation dialog when navigating back
    const handleBackPress = () => {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn thoát?",
        [
          {
            text: "Hủy",
            onPress: () => {},
            style: "cancel",
          },
          {
            text: "Thoát",
            onPress: () => router.back(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    };
  
    const renderItem = ({ item, index }: { item: any; index: number }) => {
      return (
        <QuestionItem
          item={item}
          index={index}
          currentIndex={currentIndex}
          handleWordPress={handleWordPress}
          handleAnswerSelect={handleAnswerSelect}
          animation={animation}
          isPlaying={isPlaying}
          togglePlayback={togglePlayback}
          audioProgress={audioProgress}
          audioDuration={audioDuration}
          handleSliderChange={handleSliderChange}
          generateExplanation={generateExplanation}
          isVisibleDiscuss={isVisibleDiscuss}
          setIsVisibleDiscuss={setIsVisibleDiscuss}
        />
      );
    };
  
    const getItemLayout = useCallback(
      (_: any, index: number) => ({ length: width, offset: width * index, index }),
      []
    );
  
    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null && index !== undefined) {
          setCurrentIndex(index);
        }
      }
    }, []);
  
    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });
  
    // Main Render
    if (loading) {
      return <LoadingScreen />;
    }
  
    if (error) {
      return (
        <ErrorScreen
          error={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            fetchQuestions();
          }}
        />
      );
    }
  
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Header
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onBackPress={handleBackPress}
        />
  
        {/* FlatList for Questions */}
        <FlatList
          data={questions}
          horizontal
          pagingEnabled
          scrollEnabled
          ref={flatListRef}
          renderItem={renderItem}
          keyExtractor={(item) => item.question_id.toString()}
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 100);
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig.current}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
  
        {/* Explanation Modal */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={styles.bottomModal}
        >
          <View style={styles.modalContent}>
            {allQuestionsAnswered(selectedAnswers) ? (
              <>
                <Text style={styles.modalTitle}>Hoàn thành</Text>
                <Text style={styles.modalText}>
                  Bạn đã hoàn thành bài kiểm tra!
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Giải thích</Text>
                <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                  <Text style={styles.modalText} selectable={true}>
                    {currentExplanation}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modal>
  
        {/* Vocabulary Info Modal */}
        <GetInfoVocab
          isVocabModalVisible={isVocabModalVisible}
          setVocabModalVisible={setVocabModalVisible}
          infoVocabCurrent={infoVocabCurrent}
          vocabExample={vocabExample}
          wordLists={wordLists}
          vocabInput={vocabInput}
          setVocabInput={setVocabInput}
          addWordToVocabList={addWordToVocabList}
          setSnackbarMessage={setSnackbarMessage}
          setSnackbarVisible={setSnackbarVisible}
        />
  
        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: "Đóng",
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    );
  };
  
  export default QuestionScreen;
  

















  LogBox.ignoreLogs([
    "TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
  ]);