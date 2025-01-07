import { AuthContext } from "@/context/AuthContext";
import React, { useContext, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import moment from "moment";

interface CommentProps {
  comment: {
    id: number;
    username: string;
    text: string;
    avatar: string;
  };
  onReply: (id: number) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, onReply }) => {
  const {user} = useContext(AuthContext);
  

 
  return (
    <View style={styles.commentContainer}>
      <Image source={{ 
        uri: comment.avatar,
       }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>
          {comment.username === user?.username ? "You" : comment.username}
        </Text>
        <Text style={styles.date}>
          {moment(comment.created_at).fromNow()}
        </Text>
        </View>
        <Text style={styles.text}>{comment.content}</Text>
        <TouchableOpacity onPress={() => onReply(comment.id)} style={styles.replyButtonContainer}>
          <Text style={styles.replyButton}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "orange",
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  text: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
  replyButtonContainer: {
    marginTop: 5,
  },
  replyButton: {
    color: "#8cbf26",
    fontSize: 14,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  usernameContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
});

export default Comment;
