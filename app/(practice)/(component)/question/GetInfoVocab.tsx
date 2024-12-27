import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Modal as PaperModal, Portal, Button } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { styles } from "../../styles/question.style";

const GetInfoVocab = ({
  isVocabModalVisible,
  setVocabModalVisible,
  infoVocabCurrent,
  vocabExample,
  wordLists,
  vocabInput,
  setVocabInput,
  addWordToVocabList,
  setSnackbarMessage,
  setSnackbarVisible,
}: any) => {
  return (
    <View>
      <Portal>
        <PaperModal
          visible={isVocabModalVisible}
          onDismiss={() => setVocabModalVisible(false)}
          contentContainerStyle={styles.paperModalContainer}
        >
          {infoVocabCurrent &&
          infoVocabCurrent.data &&
          infoVocabCurrent.data.length > 0 ? (
            <ScrollView>
              {infoVocabCurrent.data.slice(0, 1).map((vocab: any) => (
                <View key={vocab.mobileId || vocab.id}>
                  <Text style={styles.wordTitle}>{vocab.word}</Text>
                  {vocab.phonetic && (
                    <Text style={styles.phoneticText}>
                      [ {vocab.phonetic} ]
                    </Text>
                  )}
                  {vocab.short_mean && (
                    <Text style={styles.meanText}>
                      Nghĩa:{" "}
                      <Text style={styles.meanHighlight}>
                        {vocab.short_mean}
                      </Text>
                    </Text>
                  )}

                  {vocabExample &&
                    vocabExample.length > 0 &&
                    vocabExample.slice(0, 5).map((example, index) => (
                      <View key={index} style={styles.exampleContainer}>
                        <Text style={styles.exampleTitle}>
                          {example.content}
                        </Text>
                        <Text style={styles.exampleMean}>{example.mean}</Text>
                      </View>
                    ))}

                  {}
                  {}
                  <Picker
                    selectedValue={vocabInput}
                    onValueChange={(itemValue, itemIndex) =>
                      setVocabInput(itemValue)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Chọn danh sách từ vựng" value="" />
                    {wordLists.map((list) => (
                      <Picker.Item
                        label={list.name}
                        value={list.id}
                        key={list.id}
                      />
                    ))}
                  </Picker>

                  <View style={styles.paperModalButtons}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        addWordToVocabList(vocabInput);
                        setVocabModalVisible(false);
                        setSnackbarMessage("Đã lưu từ vựng thành công!");
                        setSnackbarVisible(true);
                      }}
                      style={styles.paperSaveButton}
                    >
                      Lưu
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setVocabModalVisible(false)}
                      style={styles.paperCancelButton}
                    >
                      Hủy
                    </Button>
                  </View>
                </View>
              ))}

              {}
              {!infoVocabCurrent.data.length && (
                <Text style={styles.paperModalText}>
                  Không tìm thấy thông tin từ vựng.
                </Text>
              )}
            </ScrollView>
          ) : (
            <Text style={styles.paperModalText}>
              Không tìm thấy thông tin từ vựng.
            </Text>
          )}
        </PaperModal>
      </Portal>
    </View>
  );
};

export default GetInfoVocab;
