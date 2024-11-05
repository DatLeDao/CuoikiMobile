import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  children: React.ReactNode;
};

const Paragraph = ({ children }: Props) => (
  <Text style={styles.text}>{children}</Text>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 14,
  },
});

export default memo(Paragraph);
