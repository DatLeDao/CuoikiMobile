import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import axios from "axios";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { LogBox } from "react-native";
import { AuthContext } from "@/context/AuthContext";
import { Snackbar } from "react-native-paper";
import { useWindowDimensions } from "react-native";
import CmIndex from "./(component)/Cmindex";
import GetInfoVocab from "./(component)/question/GetInfoVocab";
import LottieView from "lottie-react-native";
import {styles} from "./styles/question.style";

LogBox.ignoreLogs([
  "TNodeChildrenRenderer: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
]);

const { width } = Dimensions.get("window");

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${minutes}:${paddedSeconds}`;
};

const removeHTMLTags = (text) => {
  return text.replace(/<[^>]+>/g, "");
};

const tokenizeText = async (text, retryCount = 3) => {
  text = text.replace(/<p>/g, "").replace(/<\/p>/g, ""); 
  const regex = /<u>(.*?)<\/u>/g;
  const matches = text.match(regex);
  const text2 = matches
    ? matches[0].replace(/<u>/g, "").replace(/<\/u>/g, "")
    : "";
  const plainText = removeHTMLTags(text);

  // Retry logic if the API fails or returns incomplete data
  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/vocabularyAnalysis/123`,
      {
        text: plainText,
      }
    );
    
    if (response.data && response.data.status === 200) {
      const tokens = response.data.data.map((item) => {
        const [word] = item.split("\t");
        return { word };
      });

      // Check if the response contains all tokens
      if (!tokens || tokens.length === 0) {
        throw new Error("No tokens returned.");
      }

      return {
        tokens,
        textUnderline: text2,
      };
    } else {
      //console.error("Tokenizer API returned an error:", response.data);
      return { tokens: [], textUnderline: "" };
    }
  } catch (error) {
    //console.error("Error calling tokenizer API:", error);

    // Retry logic
    if (retryCount > 0) {
      console.log(`Retrying... Attempts left: ${retryCount}`);
      await new Promise(resolve => setTimeout(resolve, 1000));  // Delay before retry
      return tokenizeText(text, retryCount - 1);
    }

    // If retry limit reached, return empty tokens
    return { tokens: [], textUnderline: "" };
  }
};


const QuestionScreen = () => {
  const { num_questions, subsection_id } = useGlobalSearchParams();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const flatListRef = useRef(null);
  const animation = useRef(new Animated.Value(1)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const sliderRef = useRef(null);

  const [isVocabModalVisible, setVocabModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [vocabInput, setVocabInput] = useState("");

  const [infoVocabCurrent, setInfoVocabCurrent] = useState(null);
  const [vocabExample, setVocabExample] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const windowWidth = useWindowDimensions().width;
  const [wordLists, setWordLists] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isVisibleDiscuss, setIsVisibleDiscuss] = useState(false);

  const getListVocabularyByUserId = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/vocabulary/${userId}`
      );
      setWordLists(response.data);
    } catch (error) {
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

  const allQuestionsAnswered = (selectedAnswersState) => {
    return questions.every(
      (_, index) => selectedAnswersState[index] != null
    );
  };

  const findFirstUnanswered = (selectedAnswersState) => {
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
        fetchedQuestions.map(async (question) => {
          let parsedAnswers = [];
          let correctAnswerIndex = -1;

          try {
            parsedAnswers = JSON.parse(question.answers);
            correctAnswerIndex = parsedAnswers.findIndex(
              (answer) => answer.is_correct === 1
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
    } catch (err) {
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

  const updateUserProgress = async (user_id, question_id, is_correct) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/questions/updateUserQuestionProgress`,
        {
          user_id,
          question_id,
          is_correct,
        }
      );
    } catch (error) {
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

  const handleAnswerSelect = (answerIndex) => {
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

  const generateExplanation = async (question) => {
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
    } catch (error) {
      console.error("Error generating explanation:", error.message);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo giải thích.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const playSound = async (audioUri) => {
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
    } catch (error) {
      console.error("Error playing sound:", error);
      Alert.alert("Lỗi", "Không thể phát âm thanh.");
    }
  };

  const onPlaybackStatusUpdate = (status) => {
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

  const togglePlayback = async (audioUri) => {
    if (isPlaying) {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } else {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        await playSound(audioUri);
      }
    }
  };

  const handleSliderChange = async (value) => {
    if (sound && sound.isLoaded) {
      const seekPosition = value * 1000;
      await sound.setPositionAsync(seekPosition);
      setAudioProgress(value);
    }
  };

  const fetchVocabInfo = async (word) => {
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
    } catch (error) {
      console.error("Error fetching vocabulary info:", error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchVocabExample = async (word) => {
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
    } catch (error) {
      console.error("Error fetching vocabulary examples:", error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleWordPress = (word) => {
    if (word.trim() !== "") {
      setSelectedWord(word);
      fetchVocabInfo(word);
      setVocabModalVisible(true);
    }
  };

  const addWordToVocabList = async (listId) => {
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
      } catch (error) {
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

  

  const renderItem = ({ item, index }) => {
    const selectedAnswer = selectedAnswers[index];
    const parsedAnswers = item.parsedAnswers || [];
    const isListening = item.audio_path != null && item.audio_path !== "";

    return (
      <ScrollView
        style={{ width: windowWidth }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.questionContainer}>
          {isListening ? (
            <View style={styles.audioPlayerContainer}>
              {item.image_path ? (
                <Image
                  source={{ uri: item.image_path }}
                  style={styles.albumArt}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.albumArtPlaceholder}>
                  <Ionicons name="musical-notes" size={100} color="#ccc" />
                </View>
              )}
              <Text style={styles.audioTitle}>
                
              </Text>
             <View style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
               <TouchableOpacity
                style={styles.playPauseButton}
                onPress={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    flatListRef.current?.scrollToIndex({
                      index: currentIndex - 1,
                      animated: true,
                    });
                  }
                }}
              >
                <Ionicons name="play-back" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={() => togglePlayback(item.audio_path)}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    flatListRef.current?.scrollToIndex({
                      index: currentIndex + 1,
                      animated: true,
                    });
                  }
                }}
              >
                <Ionicons name="play-forward" size={30} color="#fff" />
              </TouchableOpacity>
              </View>
              <View style={styles.sliderContainer}>
                <Slider
                  ref={sliderRef}
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={audioDuration}
                  value={audioProgress}
                  onValueChange={(value) => setAudioProgress(value)}
                  onSlidingComplete={handleSliderChange}
                  minimumTrackTintColor="#8cbf26"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#8cbf26"
                />
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(audioProgress)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(audioDuration)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.questionBox}>
              <View style={styles.tokenContainer}>
                {item.tokens.tokens && item.tokens.tokens.length > 0 ? (
                  <Text style={styles.default}>
                    {item.tokens.tokens.map((token, tokenIndex) => (
                      <TouchableOpacity
                        key={tokenIndex}
                        onPress={() => handleWordPress(token.word)}
                        activeOpacity={0.6}
                        accessibilityLabel={`Word: ${token.word}`}
                        accessibilityHint="Tap to view vocabulary details or translate this word"
                      >
                        <Text
                          style={
                            item.tokens.textUnderline === token.word
                              ? styles.underline
                              : styles.default
                          }
                        >
                          {token.word + " "}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </Text>
                ) : (
                  <Text style={styles.default}>{item.question_text}</Text>
                )}
              </View>
              {item.image_path && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.image_path }}
                    style={styles.questionImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.answersContainer}>
            {parsedAnswers.map((answer, answerIndex) => {
              let backgroundColor = "#FFFFFF";
              let borderColor = "#DADADA";

              if (selectedAnswer != null) {
                if (answerIndex === item.correctAnswerIndex) {
                  backgroundColor = "#C8E6C9";
                  borderColor = "#388E3C";
                }
                if (
                  answerIndex === selectedAnswer &&
                  selectedAnswer !== item.correctAnswerIndex
                ) {
                  backgroundColor = "#FFCDD2";
                  borderColor = "#D32F2F";
                }
              }

              return (
                <Animated.View
                  key={answer.answer_id}
                  style={{
                    transform: [{ scale: animation }],
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity style={styles.answerIndexButton}>
                    <Text style={styles.answerIndexText}>
                      {answerIndex + 1}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      { backgroundColor, borderColor },
                    ]}
                    onPress={() => handleAnswerSelect(answerIndex)}
                    disabled={selectedAnswer != null}
                  >
                    <Text style={styles.answerText}>
                      {answer.answer_text}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.explanationButton}
            onPress={() => generateExplanation(item)}
            disabled={loadingExplanation}
          >
            {loadingExplanation ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.explanationButtonText}>Giải thích</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Discussion Section */}
        <TouchableOpacity
          style={[
            styles.discussButton,
            {
              borderBottomLeftRadius: isVisibleDiscuss ? 0 : 25,
              borderBottomRightRadius: isVisibleDiscuss ? 0 : 25,
              backgroundColor: !isVisibleDiscuss ? "#fff" : "#e3edaf",
            },
          ]}
          onPress={() => setIsVisibleDiscuss(!isVisibleDiscuss)}
          activeOpacity={1}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#000"
          />
          <Text style={styles.discussButtonText}>
            {isVisibleDiscuss ? "Ẩn thảo luận" : "Nhấp vào để thảo luận"}
          </Text>
        </TouchableOpacity>

        <View style={styles.commentSectionContainer}>
          <CmIndex
            isVisibleDisscuss={isVisibleDiscuss}
            setIsVisibleDisscuss={setIsVisibleDiscuss}
            questionId={item.question_id}
          />
        </View>
      </ScrollView>
    );
  };

  const getItemLayout = useCallback(
    (_, index) => ({ length: width, offset: width * index, index }),
    []
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }, []);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  if (loading) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <LottieView
            source={require("@/assets/lotties/loading.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  if (error) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchQuestions();
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {currentIndex + 1}/{questions.length}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="alert-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

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
        //onScrollToIndexFailed={(info) => {
        //  setTimeout(() => {
        //    flatListRef.current?.scrollToIndex({
        //      index: info.index,
        //      animated: true,
        //    });
        //  }, 100);
        //}}
        onViewableItemsChanged={onViewableItemsChanged}
        //viewabilityConfig={viewConfig.current}
        //initialNumToRender={1}
        //maxToRenderPerBatch={2}
        //windowSize={3}
      />

     
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
