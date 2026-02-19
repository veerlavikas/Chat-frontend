import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

// ✅ Point this exactly to your backend's static uploads folder
const BASE_URL = "https://chat-backend-9v66.onrender.com";
const MEDIA_PATH = "/uploads/media/"; // Change this to your backend's static folder path

export default function ChatBubble({ message, isMe }) {
  const navigation = useNavigation();

  // ✅ Helper to format the time correctly
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const dateStr = dateString.endsWith("Z") ? dateString : dateString + "Z";
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  // ✅ IMPROVED: Helper to fix Image URLs
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("file://") || url.startsWith("content://")) {
      return url;
    }
    // Ensures path has a leading slash
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    
    // If your backend serves from a specific folder like /uploads/
    return `${BASE_URL}${MEDIA_PATH}${url.split('/').pop()}`;
  };

  // ✅ WhatsApp-style Ticks Logic
  const renderTicks = () => {
    if (!isMe) return null;
    const status = message.status ?? 1; 

    if (status === 0) return <Icon name="time-outline" size={14} color="#ccc" />;
    if (status === 1) return <Icon name="checkmark" size={16} color="#ccc" />;
    if (status === 2) return <Icon name="checkmark-done" size={16} color="#ccc" />;
    if (status === 3) return <Icon name="checkmark-done" size={16} color="#34B7F1" />;
    
    return <Icon name="checkmark" size={16} color="#ccc" />;
  };

  const imageUrl = getImageUrl(message.mediaUrl);

  return (
    <View style={[styles.container, isMe ? styles.meContainer : styles.otherContainer]}>
      
      {/* 📸 IMAGE DISPLAY */}
      {message.mediaUrl ? (
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate("ImageViewer", { uri: imageUrl })}
        >
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.chatImage} 
            resizeMode="cover"
            // ✅ Log error if image fails to load
            onError={(e) => console.log("Image Load Error: ", e.nativeEvent.error, " URL: ", imageUrl)}
          />
        </TouchableOpacity>
      ) : null}

      {/* 📝 TEXT DISPLAY */}
      {message.content ? (
        <Text style={[styles.text, isMe ? styles.meText : styles.otherText]}>
          {message.content}
        </Text>
      ) : null}

      {/* 🕒 TIME & TICKS */}
      <View style={styles.metaRow}>
        <Text style={[styles.timeText, isMe ? styles.meTime : styles.otherTime]}>
          {formatTime(message.createdAt)}
        </Text>
        
        {isMe && (
          <View style={{ marginLeft: 4 }}>
            {renderTicks()}
          </View>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "80%", // Slightly wider
    borderRadius: 12,
    padding: 6,
    marginVertical: 4,
    marginHorizontal: 10,
    elevation: 1,
  },
  meContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#2c2c31", // Official WhatsApp Dark Green
    borderTopRightRadius: 2,
  },
  otherContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#202C33",
    borderTopLeftRadius: 2,
  },
  chatImage: {
    width: 240,
    height: 240, // Square looks better for chat
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#1B272E",
  },
  text: {
    fontSize: 16,
    marginHorizontal: 4,
    marginBottom: 2,
    lineHeight: 22,
    color: "#fff",
  },
  meText: { color: "#fff" },
  otherText: { color: "#fff" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center", // Center ticks with time
    marginTop: 2,
    marginRight: 2,
  },
  timeText: {
    fontSize: 11,
  },
  meTime: { color: "rgba(255,255,255,0.6)" },
  otherTime: { color: "rgba(255,255,255,0.6)" },
});