import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface ReplyProps {
  onSendReply: (replyText: string) => void;
  onCancelReply: () => void;
}

const Reply: React.FC<ReplyProps> = ({ onSendReply, onCancelReply }) => {
  const [replyText, setReplyText] = useState<string>("");

  const handleSendReply = () => {
    if (replyText.trim()) {
      onSendReply(replyText);
      setReplyText("");
      Keyboard.dismiss();
    }
  };

  const handleCancel = () => {
    setReplyText("");
    onCancelReply();
    Keyboard.dismiss();
  };

  return (
    <Animated.View style={styles.replyContainer}>
      <View style={styles.header}>
        <TextInput
          style={styles.textInput}
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Write a reply..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <AntDesign name="closecircle" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSendReply}
          style={[
            styles.sendButton,
            { backgroundColor: replyText.trim() ? "#8cbf26" : "#a5d6a7" },
          ]}
          disabled={!replyText.trim()}
          accessibilityLabel="Send Reply"
          accessibilityHint="Sends your reply"
        >
          <AntDesign name="arrowright" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  replyContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sendButton: {
    backgroundColor: "#8cbf26",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Reply;
