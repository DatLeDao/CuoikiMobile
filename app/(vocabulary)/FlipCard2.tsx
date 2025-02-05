import React from 'react';
import { Pressable, View, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const FlipCard = ({
  frontContent,
  backContent,
  cardStyle,
  duration = 500,
  direction = 'y',
  resetFlip, 
}) => {
  const isFlipped = useSharedValue(0);

  const flipStyleFront = useAnimatedStyle(() => {
    const rotation = interpolate(isFlipped.value, [0, 1], [0, 180]);
    return {
      transform: [
        direction === 'x'
          ? { rotateX: `${rotation}deg` }
          : { rotateY: `${rotation}deg` },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const flipStyleBack = useAnimatedStyle(() => {
    const rotation = interpolate(isFlipped.value, [0, 1], [180, 360]);
    return {
      transform: [
        direction === 'x'
          ? { rotateX: `${rotation}deg` }
          : { rotateY: `${rotation}deg` },
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
    };
  });

  const handlePress = () => {
    isFlipped.value = withTiming(isFlipped.value === 0 ? 1 : 0, { duration });
  };

  React.useEffect(() => {
    isFlipped.value = withTiming(0, { duration });
  }, [resetFlip]);

  return (
    <Pressable onPress={handlePress}>
      <View style={[styles.cardContainer, cardStyle]}>
        <Animated.View style={[styles.card, styles.cardFront, flipStyleFront]}>
          {frontContent}
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, flipStyleBack]}>
          {backContent}
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',

    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: '#fff',
  },
  cardBack: {
    backgroundColor: '#fff',
  },
});

export default FlipCard;