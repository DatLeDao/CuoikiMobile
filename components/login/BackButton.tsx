import React, { forwardRef, memo } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

type Props = {
  onPress?: () => void;
};

const BackButton = forwardRef<TouchableOpacity, Props>(function BackButton(
  { onPress },
  ref,
) {
  return (
    <TouchableOpacity ref={ref} onPress={onPress} style={styles.container}>
      <Image style={styles.image} source={require('@/assets/arrow_back.png')} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Math.max(Constants.statusBarHeight, 20) + 10,
    left: 10,
  },
  image: {
    width: 24,
    height: 24,
  },
});

export default memo(BackButton);
