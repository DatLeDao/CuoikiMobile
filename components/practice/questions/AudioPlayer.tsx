import React  from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/app/(practice)/styles/question.style";

interface AudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  audioProgress: number;
  audioDuration: number;
  onSlidingComplete: (value: number) => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  return `${minutes}:${paddedSeconds}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  audioProgress,
  audioDuration,
  onSlidingComplete,
}) => {
  return (
    <View style={styles.audioPlayerContainer}>
      <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity style={styles.playPauseButton} onPress={onPrevious}>
          <Ionicons name="play-back" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseButton} onPress={onPlayPause}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseButton} onPress={onNext}>
          <Ionicons name="play-forward" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={audioDuration}
          value={audioProgress}
          onValueChange={() => {}}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor="#8cbf26"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#8cbf26"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(audioProgress)}</Text>
          <Text style={styles.timeText}>{formatTime(audioDuration)}</Text>
        </View>
      </View>
    </View>
  );
};

export default AudioPlayer;
