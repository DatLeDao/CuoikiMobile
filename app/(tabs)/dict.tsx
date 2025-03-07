import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Speech from "expo-speech";
import SignatureCanvas from "react-native-signature-canvas";
import Modal from "react-native-modal";
import axios from "axios";

export default function DictionaryWithSuggestionsAndDrawing() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordData, setWordData] = useState(null); 
  const [hanViet, setHanViet] = useState(null); 
  const [errorText, setErrorText] = useState("");
  const [suggestions, setSuggestions] = useState([]); 
  const [similarChars, setSimilarChars] = useState([]); 
  const [examples, setExamples] = useState([]);

  const [drawingModalVisible, setDrawingModalVisible] = useState(false);
  const signatureRef = useRef(null);


  const fetchWordData = async (q) => {
    const payload = { dict: "javi", type: "word", query: q, page: 1 };
    const response = await fetch("https://mazii.net/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  };
  const fetchExamples = async (q) => {
    const payload = { dict: "javi", type: "example", query: q, page: 1 };
    const response = await fetch("https://mazii.net/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  }

  


  const sendDrawingToServer = (image) => {
    axios
      .post(`${process.env.EXPO_PUBLIC_API_URL2}/predict`, { image: image })
      .then((response) => {
      
        const predictions = response.data.predictions;
        const similarChars = Object.keys(predictions).map((key) => {
          const [char] = predictions[key].split(" ");
          return { char, prob: parseFloat(predictions[key]) };
        });
        setSimilarChars(similarChars);
        
      })
      .catch((error) => {
        //console.error("Error:", error);
      });
  };

  const fetchKanjiData = async (q) => {
    const payload = { dict: "javi", type: "kanji", query: q, page: 1 };
    const response = await fetch("https://mazii.net/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchWordData(query)
          .then((res) => {
            if (res.data && res.data.length > 0) {
              setSuggestions(res.data.slice(0, 5));
            } else if (res.results && res.results.length > 0) {
              setSuggestions(res.results.slice(0, 5));
            } else {
              setSuggestions([]);
            }
          })
          .catch((err) => {
            //console.error("Suggestion error:", err);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const onSelectSuggestion = (suggestion) => {
    setQuery(suggestion.word || suggestion.content);
    setSuggestions([]);
    lookup(suggestion.word || suggestion.content);
  };

  const lookup = async (qParam) => {
    const q = qParam || query;
    if (!q.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập từ/kanji");
      return;
    }
    setLoading(true);
    setErrorText("");
    setWordData(null);
    setHanViet(null);
    try {
      const wordRes = await fetchWordData(q);
      const kanjiRes = await fetchKanjiData(q);

      const examplesRes = await fetchExamples(q);

      if (wordRes.data && wordRes.data.length > 0) {
        setWordData(wordRes.data[0]);
      } else if (wordRes.results && wordRes.results.length > 0) {
        setWordData(wordRes.results[0]);
      } else {
        setWordData(null);
      }

      if (
        kanjiRes.status === 200 &&
        kanjiRes.results &&
        kanjiRes.results.length > 0
      ) {
        const first = kanjiRes.results[0];
        setHanViet(first.mean || null);
      } else {
        setHanViet(null);
      }

      if (
        (!wordRes.data || wordRes.data.length === 0) &&
        (!wordRes.results || wordRes.results.length === 0) &&
        (!kanjiRes.results || kanjiRes.results.length === 0)
      ) {
        setErrorText("Không tìm thấy kết quả.");
      }

      if (examplesRes.data && examplesRes.data.length > 0) {
        setExamples(examplesRes.data);
      } else if (examplesRes.results && examplesRes.results.length > 0) {
        setExamples(examplesRes.results);
      } else {
        setExamples([]);
      }

    } catch (error) {
      setErrorText("Lỗi khi gọi API: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!text) return;
    Speech.speak(text, { language: "ja" });
  };

  const handleDrawingOK = async (sig) => {
    await sendDrawingToServer(sig);
    setDrawingModalVisible(false);
  };

  const handleDrawingClear = () => {
    signatureRef.current?.clearSignature();
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;
    return (
      <View style={styles.suggestionContainer}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSelectSuggestion(item)}
            >
              <Text style={styles.suggestionText}>
                {item.word || item.content} -{" "}
                {item.short_mean || item.mean || ""}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderWordCard = () => {
    if (!wordData) return null;
    return (
      <View style={styles.card}>
        <View style={styles.wordHeader}>
          <Text style={styles.wordText}>{wordData.word || "Từ"}</Text>
          <TouchableOpacity onPress={() => speak(wordData.word)}>
            <Ionicons name="volume-high" size={35} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {hanViet && (
          <Text style={styles.hanVietText}>
            Hán Việt: <Text style={{ color: "#333" }}>{hanViet}</Text>
          </Text>
        )}
        {wordData.phonetic && (
          <Text style={styles.phoneticText}>{wordData.phonetic}</Text>
        )}
        {wordData.short_mean && (
          <Text style={styles.meanText}>Nghĩa: {wordData.short_mean}</Text>
        )}

        
        {examples.length > 0 && (
          <View style={styles.meanBlock}>
            <Text style={styles.kindText}>Ví dụ:</Text>
            {examples.map((item, index) => (
              <View key={index} style={styles.exampleItem}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleWord}>{item.content}</Text>
                  <TouchableOpacity onPress={() => speak(item.content)}>
                    <Ionicons name="volume-high" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.exampleReading}>{item.reading}</Text>
                <Text style={styles.exampleMean}>{item.mean}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Từ điển Kanji</Text>
        <TouchableOpacity
          style={styles.drawButton}
          onPress={() => setDrawingModalVisible(true)}
        >
          <Ionicons name="create" size={24} color="#e3edaf" />
          <Text style={styles.drawButtonText}>Vẽ Kanji</Text>
        </TouchableOpacity>
      </View>

      {/* Search Area */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập từ hoặc Kanji..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={(t) => setQuery(t)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => lookup()}>
          <Text style={styles.searchButtonText}>Tra</Text>
        </TouchableOpacity>
      </View>

      {renderSuggestions()}

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {loading && <ActivityIndicator size="large" color="#e3edaf" />}

     
      <ScrollView style={styles.resultScroll}>
        {renderWordCard()}
      </ScrollView>

     
      <Modal visible={drawingModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Vẽ Kanji</Text>
          <View style={styles.canvasWrapper}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleDrawingOK}
              onClear={handleDrawingClear}
              autoClear={false}
              descriptionText=""
              webStyle={`
                .m-signature-pad { background-color: black; border: none; border-radius: 10px; }
                .m-signature-pad--body { border: none; }
                .m-signature-pad--footer { display: flex; justify-content: space-between; align-items: center; }
                .button { background-color: #e3edaf; color: #fff; border-radius: 4px; margin: 4px; }
              `}
              penColor={"white"} // Màu bút trắng
              minWidth={4}
              maxWidth={6}
              imageType={"image/png"}
            />
          </View>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setDrawingModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Display Similar Chars */}
      <View style={styles.suggestionContainer}>
        {similarChars.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => {
              setQuery(query + item.char)
              setSimilarChars([])
            }}
          >
            <Text style={styles.suggestionText}>
              {item.char}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#8cbf26" },
  drawButton: { flexDirection: "row", alignItems: "center" },
  drawButtonText: { marginLeft: 4, color: "#8cbf26", fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    height: 60,
    borderColor: "#e3edaf",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 25,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "#e3edaf",
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: "center",
    
    
  },
  searchButtonText: { color: "#000", fontWeight: "bold" , fontSize: 20},
  suggestionContainer: {
 
    backgroundColor: "#fff",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  suggestionItem: {
    padding: 8,
    paddingLeft: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
    fontSize: 14,
    flex: 1,
  },
  suggestionText: { fontSize: 25, color: "#000" },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 10,
    fontWeight: "bold",
  },
  resultScroll: { marginTop: 12, paddingHorizontal: 16 },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
  },
  wordHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordText: { fontSize: 30, fontWeight: "bold", color: "#007AFF" },
  hanVietText: { marginTop: 4, fontSize: 22, fontWeight: "600", color: "#333" },
  phoneticText: { marginTop: 4, fontSize: 22, color: "#666", fontStyle: "italic" },
  meanText: { marginTop: 6, fontSize: 22, color: "#333" },
  meanBlock: { marginTop: 8, borderTopWidth: 1, borderColor: "#eee", paddingTop: 6 },
  kindText: { fontSize: 14, color: "#FF6600", fontWeight: "600" },
  meaning: { marginTop: 4, fontSize: 16, color: "#333" },
  exampleItem: {
    marginTop: 6,
    backgroundColor: "#fafafa",
    borderRadius: 6,
    padding: 6,
  },
  exampleHeader: { flexDirection: "row", alignItems: "center" },
  exampleWord: { fontSize: 16, fontWeight: "bold", color: "#333" },
  exampleReading: { fontSize: 14, color: "#666" },
  exampleMean: { fontSize: 14, color: "#444" },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  modalTitle: { textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#e3edaf", marginBottom: 16 },
  canvasWrapper: {
    width: "100%",
    height: 350,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalCloseButton: {
    marginTop: 16,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#e3edaf",
    borderRadius: 8,
  },
  modalCloseButtonText: { color: "#fff", fontWeight: "bold" },
});
