import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 250,
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Overlay background
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    color: "#333",
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  contentContainer: {
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.1, // iOS shadow
    shadowRadius: 4, // iOS shadow
  },
});

// Styling cho Markdown
export const markdownStyles = {
  heading1: {
    fontSize: 28,
    color: "#8cbf26",
    fontWeight: "700",
    marginBottom: 10,
  },
  heading2: {
    fontSize: 22,
    color: "#8cbf26",
    fontWeight: "700",
    marginVertical: 10,
  },
  heading3: {
    fontSize: 20,
    color: "#8cbf26",
    fontWeight: "700",
    marginVertical: 8,
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 22,
  },
  bullet_list: {
    flexDirection: "row",
    paddingLeft: 10,
    marginBottom: 10,
  },
  list_item: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  link: {
    color: "#6a11cb",
    textDecorationLine: "underline",
  },
  image: {
    width: width - 32,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  code_block: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 14,
  },
};
