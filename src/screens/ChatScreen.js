import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert, // Added Alert for permission denials
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchChatHistory, sendMessage, uploadMediaApi } from "../api/chatApi";
import { connectSocket, sendWS } from "../utils/socket";
import ChatBubble from "../components/ChatBubble";

const BASE_IMG = "https://chat-backend-9v66.onrender.com/uploads/profile/";

export default function ChatScreen({ route, navigation }) {
  const insets = useSafeAreaInsets(); // Hook to detect notch/safe area
  const { senderId, receiver } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef();

  useEffect(() => {
    load();
    connectSocket(senderId, onReceive, onTyping);
  }, []);

  const load = async () => {
    const data = await fetchChatHistory(senderId, receiver.id);
    setMessages(data || []);
  };

  const onReceive = (msg) => {
    setMessages((p) => [...p, msg]);
    setTyping(false);
  };

  const onTyping = () => setTyping(true);

  const onSend = async () => {
    if (!text.trim()) return;
    const msg = await sendMessage({
      senderId,
      receiverId: receiver.id,
      content: text,
    });
    if (msg) {
      setMessages((p) => [...p, msg]);
      setText("");
    }
  };

  /* ✅ FIXED MEDIA PICKER WITH PERMISSIONS */
  const handleMediaPick = async (type) => {
    // 1. Ask for Permission First
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert("Permission Required", "We need access to your gallery to send images.");
        return;
    }

    let result;
    if (type === 'IMAGE') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected to Options
        quality: 0.7,
        allowsEditing: true,
      });
    } else {
      result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    }

    if (!result.canceled) {
      const asset = result.assets[0];
      
      const localMsg = {
        id: Date.now(),
        senderId,
        mediaUrl: asset.uri,
        createdAt: new Date().toISOString(),
        type: type,
        status: 0, 
      };
      setMessages((p) => [...p, localMsg]);

      try {
        const uploadedUrl = await uploadMediaApi(asset);
        sendWS("/app/chat.send", {
          senderId,
          receiverId: receiver.id,
          mediaUrl: uploadedUrl,
          type: type,
        });
      } catch (err) {
        console.error("Upload failed", err);
        Alert.alert("Upload Failed", "Could not send the file. Please try again.");
      }
    }
  };

  const onType = (t) => {
    setText(t);
    sendWS("/app/typing", { from: senderId, to: receiver.id });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0B1220" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} 
    >
      {/* Container with dynamic Safe Area Padding */}
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{
              uri: receiver.profilePic
                ? BASE_IMG + receiver.profilePic
                : "https://i.pravatar.cc/100",
            }}
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{receiver.username}</Text>
            <Text style={styles.lastSeen}>
              {typing ? "typing..." : "last seen recently"}
            </Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Call", { type: "audio", user: receiver })}>
            <Icon name="call-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={{ marginLeft: 14 }} onPress={() => navigation.navigate("Call", { type: "video", user: receiver })}>
            <Icon name="videocam-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* CHAT LIST */}
        <FlatList
          ref={ref}
          data={messages}
          keyExtractor={(i, idx) => i.id ? i.id.toString() : idx.toString()}
          renderItem={({ item }) => (
            <ChatBubble message={item} isMe={item.senderId === senderId} />
          )}
          onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        {/* INPUT AREA */}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom || 10 }]}>
          <TouchableOpacity onPress={() => handleMediaPick('IMAGE')}>
            <Icon name="image-outline" size={24} color="#38BDF8" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleMediaPick('DOC')} style={{ marginLeft: 10 }}>
            <Icon name="attach-outline" size={26} color="#38BDF8" />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={onType}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, 
  header: {
    height: 60,
    backgroundColor: "#0A84FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, margin: 10 },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  lastSeen: { color: "#E5E7EB", fontSize: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#121A2F",
  },
  input: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginHorizontal: 10,
    color: "#fff",
    height: 40,
  },
  sendBtn: {
    backgroundColor: "#0A84FF",
    padding: 10,
    borderRadius: 20,
  },
});