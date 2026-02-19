import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Video } from "expo-av";
import Icon from "react-native-vector-icons/Ionicons";

const BASE_MEDIA_URL = "https://chat-backend-9v66.onrender.com/uploads/media/";

export default function ChatBubble({ message, isMe }) {
  const status = message.status ?? 0;

  const renderTicks = () => {
    if (!isMe) return null;
    if (status === 2) return <Icon name="checkmark-done" size={14} color="#0A84FF" />;
    if (status === 1) return <Icon name="checkmark-done" size={14} color="#9CA3AF" />;
    return <Icon name="checkmark" size={14} color="#9CA3AF" />;
  };

  const renderContent = () => {
    // ✅ TEXT
    if (typeof message.content === "string" && message.content.length > 0) {
      return <Text style={styles.text}>{message.content}</Text>;
    }

    // ✅ IMAGE
    if (message.mediaUrl?.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <Image
          source={{ uri: BASE_MEDIA_URL + message.mediaUrl }}
          style={styles.image}
        />
      );
    }

    // ✅ VIDEO
    if (message.mediaUrl?.endsWith(".mp4")) {
      return (
        <Video
          source={{ uri: BASE_MEDIA_URL + message.mediaUrl }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
        />
      );
    }

    // ✅ AUDIO
    if (message.mediaUrl?.match(/\.(mp3|m4a|wav)$/i)) {
      return (
        <View style={styles.audioBox}>
          <Icon name="mic" size={18} color="#38BDF8" />
          <Text style={styles.audio}>Voice message</Text>
        </View>
      );
    }

    // ✅ DOCUMENT (PDF, DOCX, etc.)
    if (message.type === "DOC" || message.mediaUrl?.match(/\.(pdf|doc|docx|txt|xls|xlsx)$/i)) {
        return (
          <TouchableOpacity 
            style={styles.docBox} 
            onPress={() => Linking.openURL(BASE_MEDIA_URL + message.mediaUrl)}
          >
            <Icon name="document-text" size={30} color="#fff" />
            <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.docTitle} numberOfLines={1}>
                    {message.mediaUrl || "Document"}
                </Text>
                <Text style={styles.docSub}>Tap to open</Text>
            </View>
          </TouchableOpacity>
        );
      }

    return null;
  };

  return (
    <View style={[styles.bubble, isMe ? styles.me : styles.other]}>
      {renderContent()}
      <View style={styles.meta}>
        <Text style={styles.time}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        {renderTicks()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 12, marginVertical: 4, marginHorizontal: 8 },
  me: { alignSelf: "flex-end", backgroundColor: "#1E3A8A" },
  other: { alignSelf: "flex-start", backgroundColor: "#1F2937" },
  text: { fontSize: 16, color: "#fff" },
  image: { width: 220, height: 220, borderRadius: 10 },
  video: { width: 240, height: 180, borderRadius: 10 },
  audioBox: { flexDirection: "row", alignItems: "center" },
  audio: { marginLeft: 6, fontSize: 15, color: "#38BDF8" },
  // ✅ NEW DOCUMENT STYLES
  docBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 8, width: 200 },
  docTitle: { color: "#fff", fontSize: 14, fontWeight: "500" },
  docSub: { color: "#9CA3AF", fontSize: 11 },
  meta: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", marginTop: 4 },
  time: { fontSize: 10, color: "#D1D5DB", marginRight: 4 },
});