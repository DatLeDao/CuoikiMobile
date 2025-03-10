import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';


function Header({ title }) {
  const route = useRouter();
  return (
    <View style={styles.headerContainer}>
      <Ionicons
        name="arrow-back"
        size={30}
        color="#b3b300"
        onPress={() => route.back()}
      />
      <Text style={styles.title}>Bộ từ vựng</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    paddingLeft: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
}) 