// components/QuestionItem.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AudioPlayer from "./AudioPlayer";
import Answers from "./Answers";
import { styles } from "@/app/(practice)/styles/question.style";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import CmIndex from "@/app/(practice)/(component)/Cmindex";

interface Token {
  word: string;
  details: string;
}

interface Tokens {
  tokens: Token[];
  textUnderline: string;
}

interface Question {
  question_id: number;
  question_text: string;
  image_path: string | null;
  audio_path: string | null;
  parsedAnswers: any[];
  correctAnswerIndex: number;
  tokens: Tokens;
}

interface QuestionItemProps {
  item: Question;
  index: number;
  currentIndex: number;
  handleWordPress: (word: string) => void;
  handleAnswerSelect: (answerIndex: number) => void;
  animation: Animated.Value;
  isPlaying: boolean;
  togglePlayback: () => void;
  audioProgress: number;
  audioDuration: number;
  handleSliderChange: (value: number) => void;
  generateExplanation: (question: Question) => void;
  isVisibleDiscuss: boolean;
  setIsVisibleDiscuss: (visible: boolean) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  item,
  index,
  currentIndex,
  handleWordPress,
  handleAnswerSelect,
  animation,
  isPlaying,
  togglePlayback,
  audioProgress,
  audioDuration,
  handleSliderChange,
  generateExplanation,
  isVisibleDiscuss,
  setIsVisibleDiscuss,
}) => {
  const { user } = useContext(AuthContext);

  return (
    <ScrollView  contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.questionContainer}>
        {item.audio_path ? (
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
            <AudioPlayer
              isPlaying={isPlaying}
              onPlayPause={togglePlayback}
              onPrevious={() => {}}
              onNext={() => {}}
              audioProgress={audioProgress}
              audioDuration={audioDuration}
              onSlidingComplete={handleSliderChange}
            />
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

        <Answers
          parsedAnswers={item.parsedAnswers}
          selectedAnswer={null} // You'll need to pass the actual selected answer
          correctAnswerIndex={item.correctAnswerIndex}
          onSelect={handleAnswerSelect}
          animation={animation}
        />

        <TouchableOpacity
          style={styles.explanationButton}
          onPress={() => generateExplanation(item)}
          disabled={false} // You'll need to pass the actual loading state
        >
          {/* Replace with actual loading state if needed */}
          <Text style={styles.explanationButtonText}>Giải thích</Text>
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
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#000" />
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

export default QuestionItem;
