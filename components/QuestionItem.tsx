import { Link } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';



const QuestionItem = ({ item }) => {
  const questionProgress = useSharedValue(0);

  useEffect(() => {
    const percentage = calculateProgressPercentage(item.rate);
    questionProgress.value = withTiming(percentage, { duration: 1000 });
  }, [questionProgress, item.rate]);

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    width: `${questionProgress.value}%`,
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(item.id * 100)}
      style={styles.questionWrapper}
    >
      <Link href="/mondai-detail">
        <TouchableOpacity activeOpacity={0.7} style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{item.title}</Text>
          <Text style={styles.questionRate}>{item.rate}</Text>
          <View style={styles.questionProgressContainer}>
            <Animated.View style={[styles.questionProgressBar, questionAnimatedStyle]} />
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

// Helper function to calculate progress percentage from rate string
const calculateProgressPercentage = (rate) => {
  const match = rate.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
};

const styles = StyleSheet.create({
  questionWrapper: {
    marginBottom: 15,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004d40',
    marginBottom: 6,
  },
  questionRate: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  questionProgressContainer: {
    height: 10,
    backgroundColor: '#cfd8dc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  questionProgressBar: {
    height: '100%',
    backgroundColor: '#ff7043',
  },
});

export default QuestionItem;
