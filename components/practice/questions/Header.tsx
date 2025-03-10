import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { styles } from "@/app/(practice)/styles/question.style";

interface HeaderProps {
  currentIndex: number;
  totalQuestions: number;
  onBackPress: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentIndex,
  totalQuestions,
  onBackPress,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerText}>
        {totalQuestions > 0 ? `${currentIndex + 1}/${totalQuestions}` : "0/0"}
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
  );
};

export default Header;
