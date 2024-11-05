import React, { memo } from 'react';
import { View, StyleSheet, Text, TextInput as Input } from 'react-native';

type Props = React.ComponentProps<typeof Input> & { errorText?: string };

const TextInput = ({ errorText, ...props }: Props) => (
  <View style={styles.container}>
    <Input
      style={styles.input}
      cursorColor="grey"
      {...props}
    />
    {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  input: {
    borderColor: 'black',
    borderRadius: 4,
    borderWidth: 1,
    height: 48,
    padding: 16,
    backgroundColor: 'white'
  },
  error: {
    fontSize: 14,
    color: 'red',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
});

export default memo(TextInput);
