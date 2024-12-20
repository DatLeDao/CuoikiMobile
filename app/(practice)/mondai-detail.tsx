import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import axios from 'axios';

const KanjiReadingScreen = () => {
  const [isCheckEnabled, setIsCheckEnabled] = useState(false);
  const [isAutoNextEnabled, setIsAutoNextEnabled] = useState(false);
  const [selectedNumberOfQuestions, setSelectedNumberOfQuestions] =
    useState(10);
  const [subsection, setSubsection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { subsection_id } = useGlobalSearchParams(); // Lấy subsection_id từ global

  const fetchData = async () => {
    if (!subsection_id) {
      setError('Subsection ID không hợp lệ.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/questions/mondais/${subsection_id}`
      );
      setSubsection(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subsection_id]);

  const questionNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e3edaf', '#e3edaf']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <Ionicons
            name="arrow-back"
            size={28}
            color="#333"
            onPress={() => router.back()}
          />
          <Text style={styles.headerText}>
            {subsection?.subsection_name || 'Không xác định'}
          </Text>
          <Ionicons name="book-outline" size={28} color="#333" />
        </View>
        <Text style={styles.headerSubText}>Level: N3</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.settingsContainer}>
            <View style={styles.settingOption}>
              <Text style={styles.optionText}>Số câu hỏi</Text>
              <View style={[styles.pickerContainer, styles.dropdownWrapper]}>
                <Picker
                  selectedValue={selectedNumberOfQuestions}
                  onValueChange={(itemValue) =>
                    setSelectedNumberOfQuestions(itemValue)
                  }
                  style={styles.picker}
                >
                  {questionNumbers.map((number) => (
                    <Picker.Item
                      label={`${number}`}
                      value={number}
                      key={number}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.settingOption}>
              <Text style={styles.optionText}>Kiểm tra</Text>
              <Switch
                value={isCheckEnabled}
                onValueChange={(value) => setIsCheckEnabled(value)}
                thumbColor={isCheckEnabled ? '#ffffff' : '#ffffff'}
                trackColor={{ false: '#ccc', true: '#4caf50' }}
                ios_backgroundColor="#ccc"
              />
            </View>

            <View style={styles.settingOption}>
              <Text style={styles.optionText}>Tự động chuyển câu</Text>
              <Switch
                value={isAutoNextEnabled}
                onValueChange={(value) => setIsAutoNextEnabled(value)}
                thumbColor={isAutoNextEnabled ? '#ffffff' : '#ffffff'}
                trackColor={{ false: '#ccc', true: '#4caf50' }}
                ios_backgroundColor="#ccc"
              />
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              <Text style={styles.boldText}>Kiểm tra:</Text> Khi bật: Bạn có thể
              xem giải thích trong quá trình làm bài!
            </Text>
            <Text style={styles.noteText}>
              Khi tắt: Trải nghiệm thi thử như thi thật, có bấm giờ và không thể
              xem giải thích!
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/question',
                params: {
                  subsection_id: subsection_id,
                  num_questions: selectedNumberOfQuestions,
                },
              })
            }
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Bắt đầu</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSubText: {
    color: '#555',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
    color: '#4caf50',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: 150,
    color: '#4caf50',
  },
  noteContainer: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  noteText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#e3edaf',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default KanjiReadingScreen;
