import React, { useContext, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

interface InputCommentProps {
  onSendComment: (commentText: string) => void;
}

const InputComment: React.FC<InputCommentProps> = ({ onSendComment,questionId }) => {
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user} = useContext(AuthContext);

  const handleSubmit = async () => {
  if (comment.trim()) {
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/comment/addCommentInQuestion`,
        {
          question_id: questionId,
          comment: comment,
          user_id: user.id,
        }
      );
      onSendComment({
        id: user.id,
        username: "You",
        content: comment,
        avatar: user.avatar,
        created_at: new Date().toISOString(),
      });

      setComment(""); 
      Keyboard.dismiss();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập bình luận của bạn..."
          placeholderTextColor="#aaa"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={2}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: comment.trim() ? "#8cbf26" : "#a5d6a7" },
          ]}
          onPress={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          accessibilityLabel="Send Comment"
          accessibilityHint="Sends your comment"
        >
          {isSubmitting ? (
            <AntDesign name="loading1" size={24} color="#fff" />
          ) : (
            <AntDesign name="arrowright" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      {!comment.trim() && (
        <Text style={styles.placeholderText}>
          Bạn có thể bình luận về câu hỏi này!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#e3edaf",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 20,
    paddingRight: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    color: "#000",
  },
  sendButton: {
    marginLeft: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8cbf26",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderText: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },
});

export default InputComment;
