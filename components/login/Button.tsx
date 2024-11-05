import React, { forwardRef, memo } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, TouchableNativeFeedback, TouchableOpacity, Platform, Text, TextStyle } from 'react-native';

type Props = React.ComponentProps<typeof TouchableOpacity> & {
  style?: ViewStyle;
  labelStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

const Button = forwardRef<TouchableOpacity, Props>(function Button(
  { style, labelStyle, children, ...props }: Props,
  ref,
) {

  // @ts-expect-error
  const Touchable: typeof TouchableNativeFeedback =
    Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

  if (Array.isArray(style)) {
    throw new Error('style array not supported');
  }

  const styleEntries = Object.entries(style ? style : {});

  const a = styleEntries.filter(([key]) => {
    return key.startsWith('border') || key.startsWith('margin')|| key.startsWith('overflow') || key.startsWith('width')
  })

  const b = styleEntries.filter(e => !a.includes(e));

  return (
    <View style={{ borderRadius: 16, overflow: 'hidden', flexDirection: 'row', elevation: 4, marginVertical: 10, width: '100%', ...Object.fromEntries(a) }}>
      <Touchable ref={ref} accessibilityRole="button" {...props} style={{ flex: 1 }}>
        <View style={[styles.button, Object.fromEntries(b)]}>
          <Text style={[styles.text, labelStyle]}>
            {children}
          </Text>
        </View>
      </Touchable>
    </View>
  );
});

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 46,
    overflow: 'hidden',
    backgroundColor: '#6750a4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 26,
    color: 'white'
  },
});

export default memo(Button);
