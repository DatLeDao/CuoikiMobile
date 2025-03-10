import React from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { styles } from "@/app/(practice)/styles/question.style";

interface Answer {
  answer_id: number;
  answer_text: string;
  is_correct: number;
}

interface AnswersProps {
  parsedAnswers: Answer[];
  selectedAnswer: number | null;
  correctAnswerIndex: number;
  onSelect: (index: number) => void;
  animation: Animated.Value;
}

const Answers: React.FC<AnswersProps> = ({
  parsedAnswers,
  selectedAnswer,
  correctAnswerIndex,
  onSelect,
  animation,
}) => {
  return (
    <View style={styles.answersContainer}>
      {parsedAnswers.map((answer, answerIndex) => {
        let backgroundColor = "#FFFFFF";
        let borderColor = "#DADADA";

        if (selectedAnswer != null) {
          if (answerIndex === correctAnswerIndex) {
            backgroundColor = "#C8E6C9";
            borderColor = "#388E3C";
          }
          if (
            answerIndex === selectedAnswer &&
            selectedAnswer !== correctAnswerIndex
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
              <Text style={styles.answerIndexText}>{answerIndex + 1}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.answerButton,
                { backgroundColor, borderColor },
              ]}
              onPress={() => onSelect(answerIndex)}
              disabled={selectedAnswer != null}
            >
              <Text style={styles.answerText}>{answer.answer_text}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default Answers;
