import React, { useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FlipCard from './FlipCard'; 
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');

const FlashcardDeck = ({ vocabularies }) => {
  const [currentIndex, setCurrentIdx] = useState(0);
  const totalCards = Array.isArray(vocabularies) ? vocabularies.length : 0;
  const translateX = useSharedValue(0);

  const incrementIndex = () => {
    setCurrentIdx(prevIndex => {
      if (prevIndex < totalCards - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const decrementIndex = () => {
    setCurrentIdx(prevIndex => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      translateX.value = withTiming(-width, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(incrementIndex)();
          translateX.value = withTiming(0, { duration: 300 });
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      translateX.value = withTiming(width, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(decrementIndex)();
          translateX.value = withTiming(0, { duration: 300 });
        }
      });
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const currentVocab = Array.isArray(vocabularies) ? vocabularies[currentIndex] : undefined;

  if (!currentVocab) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Flashcard not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedCardStyle, styles.cardWrapper]}>
        <FlipCard
          key={currentIndex} 
          cardStyle={styles.flipCard}
          frontContent={
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>{currentVocab.front}</Text>
            </View>
          }
          backContent={
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>{currentVocab.back}</Text>
            </View>
          }
          resetFlip={currentIndex} 
        />
      </Animated.View>
      <View style={styles.navigation}>
        <Pressable
          onPress={handlePrevious}
          style={[
            styles.iconButton,
            currentIndex === 0 && styles.disabledButton,
          ]}
          disabled={currentIndex === 0}>
          <Icon name="navigate-before" size={25} color="#000" />
        </Pressable>
        <Text style={styles.counter}>
          {currentIndex + 1}/{totalCards}
        </Text>
        <Pressable
          onPress={handleNext}
          style={[
            styles.iconButton,
            currentIndex === totalCards - 1 && styles.disabledButton,
          ]}
          disabled={currentIndex === totalCards - 1}>
          <Icon name="navigate-next" size={25} color="#000" />
        </Pressable>
      </View>
    </View>
  );
};

FlashcardDeck.propTypes = {
  vocabularies: PropTypes.arrayOf(
    PropTypes.shape({
      front: PropTypes.string.isRequired,
      back: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    justifyContent: 'center', 
  },
  cardWrapper: {
    width: width * 0.8,
    height: 250,
    justifyContent: 'center',
  },
  flipCard: {
    width: '100%',
    height: 200,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, 
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 40,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#bbbbbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  counter: {
    fontSize: 18,
    marginHorizontal: 20,
    color: '#001a72',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16,
  },
  cardText: {
    fontSize: 20,
    color: 'orange',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default FlashcardDeck;