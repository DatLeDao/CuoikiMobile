import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Comment from "./Comment";
import Reply from "./Reply";
import InputComment from "./InputComment";
import axios from "axios";

interface ReplyType {
  id: number;
  username: string;
  avatar: string;
  content: string;
  created_at: string;
}

interface CommentType {
  id: number;
  username: string;
  avatar: string;
  content: string;
  created_at: string;
  replies: ReplyType[];
}

interface CmIndexProps {
  isVisibleDisscuss: boolean;
  setIsVisibleDisscuss: (visible: boolean) => void;
  questionId: number;
}

const CmIndex: React.FC<CmIndexProps> = ({ isVisibleDisscuss, setIsVisibleDisscuss, questionId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);

  const handleReply = (commentId: number) => {
    setActiveCommentId(commentId);
  };

  const handleSendReply = (replyContent: string) => {
    if (activeCommentId !== null) {
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === activeCommentId) {
            return {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Date.now(), // Sử dụng ID duy nhất thích hợp
                  username: "You",
                  avatar: "https://link-avatar-cua-ban.com/avatar.jpg", // Cập nhật URL avatar của bạn
                  content: replyContent,
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }
          return comment;
        })
      );
      setActiveCommentId(null);
    }
  };

  const handleGetComments = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/comment/getCommentsAndRepliesByQuestionId/${questionId}`
      );

      const comments: CommentType[] = response.data.map((comment: any) => {
        // Parse phần user_info
        let userInfo = { username: "", avatar: "" };
        try {
          userInfo = JSON.parse(comment.comment_user_info);
        } catch (error) {
          console.error("Error parsing comment_user_info:", error);
        }

        // Parse phần replies
        let parsedReplies: ReplyType[] = [];
        try {
          parsedReplies = comment.replies;
        } catch (error) {
          console.error("Error parsing replies:", error);
          parsedReplies = []; // Đặt thành mảng rỗng nếu lỗi
        }

        return {
          id: comment.comment_id,
          username: userInfo.username,
          avatar: userInfo.avatar,
          content: comment.comment_content,
          created_at: comment.comment_created_at,
          //replies: parsedReplies.map((reply: any) => ({
          //  id: reply.reply_id,
          //  username: reply.reply_user_info.username,
          //  avatar: reply.reply_user_info.avatar,
          //  content: reply.reply_content,
          //  created_at: reply.reply_created_at,
          //})),
        };
      });

      // Sắp xếp comments theo thời gian tạo (mới nhất trước)
      const sortedComments = comments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setComments(sortedComments);
      
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    handleGetComments();
  }, []);

  const handleSendComment = (newComment: CommentType) => {
    setComments([newComment, ...comments]);
  };

  if (!isVisibleDisscuss) {
    return null;
  }

  return (
    <View style={styles.container}>
      <InputComment onSendComment={handleSendComment} questionId={questionId} />
      {comments.length > 0 ? (
        <ScrollView>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentContainer}>
              <Comment comment={comment} onReply={handleReply} />
              {/*{comment.replies && comment.replies.length > 0 && (
                <View style={styles.replies}>
                  {comment.replies.map((reply) => (
                    <View key={reply.id} style={styles.replyContainer}>
                      <Text style={styles.replyText}>
                        <Text style={styles.replyUsername}>
                          {reply.username === "You" ? "You" : reply.username}
                        </Text>
                        : {reply.content}
                      </Text>
                    </View>
                  ))}
                </View>
              )}*/}
              {activeCommentId === comment.id && (
                <Reply
                  onSendReply={handleSendReply}
                  onCancelReply={() => setActiveCommentId(null)}
                />
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        // Hiển thị khi chưa có comment nào
        <View style={styles.noCommentsContainer}>
          <Text style={styles.noCommentsText}>
            Hiện tại chưa có comment nào
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3edaf",
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  commentContainer: {
    marginBottom: 10,
  },
  replies: {
    marginLeft: 20,
    marginTop: 5,
  },
  replyContainer: {
    marginTop: 5,
  },
  replyText: {
    fontSize: 14,
  },
  replyUsername: {
    fontWeight: "bold",
  },
  noCommentsContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  noCommentsText: {
    color: "#555",
    fontSize: 16,
  },
});

export default CmIndex;
