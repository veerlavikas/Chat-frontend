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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchChatHistory, sendMessage, uploadMediaApi } from "../api/chatApi";
import { connectSocket, sendWS } from "../utils/socket";
import ChatBubble from "../components/ChatBubble";

const BASE_IMG = "https://chat-backend-9v66.onrender.com/uploads/profile/";
const BASE_URL = "https://chat-backend-9v66.onrender.com";
const META_AI_LOGO = "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png";

export default function ChatScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { senderId, receiver } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef();

  useEffect(() => {
    load();
    connectSocket(senderId, onReceive, onTypingEvent);
    markAsSeen();
  }, []);

  const load = async () => {
    // Fetch history based on whether it's a group or private chat
    const data = await fetchChatHistory(
        senderId, 
        receiver.isGroup ? null : receiver.id, 
        receiver.isGroup ? receiver.id : null
    );
    setMessages(data || []);
  };

  const markAsSeen = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token && !receiver.isBot) {
        // ✅ Swapped order to senderId/receiverId to resolve 404 errors
        await axios.put(`${BASE_URL}/api/chat/seen/${senderId}/${receiver.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.log("Failed to mark seen:", err.message);
    }
  };

  const onReceive = (msg) => {
    const isRelevant = receiver.isGroup 
        ? msg.groupId === receiver.id 
        : (msg.senderId === receiver.id || msg.receiverId === receiver.id);

    if (isRelevant) {
        setMessages((p) => [...p, msg]);
        setTyping(false);
        markAsSeen(); 
    }
  };

  const onTypingEvent = (data) => {
    if (data.from === receiver.id) {
      setTyping(data.typing); 
    }
  };

  const onSend = async () => {
    if (!text.trim()) return;
    const msgData = {
      senderId,
      receiverId: receiver.isGroup ? null : receiver.id,
      groupId: receiver.isGroup ? receiver.id : null,
      content: text,
    };
    const msg = await sendMessage(msgData);
    if (msg) {
      setMessages((p) => [...p, msg]);
      setText("");
    }
  };

  const handleMediaPick = async (type) => {
    try {
        let result;
        if (type === 'IMAGE') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Need gallery access to send images.");
                return;
            }

            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // ✅ Updated Syntax for Expo
                quality: 0.7,
                allowsEditing: true,
            });
        } else {
            // ✅ Document Picker Logic
            result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        }

        if (!result.canceled) {
            const asset = result.assets[0];
            
            // Only show local preview for Images
            if (type === 'IMAGE') {
                const localMsg = {
                    id: Date.now(),
                    senderId,
                    mediaUrl: asset.uri,
                    createdAt: new Date().toISOString(),
                    type: 'IMAGE',
                    status: 0, 
                };
                setMessages((p) => [...p, localMsg]);
            }

            const uploadedUrl = await uploadMediaApi(asset);
            sendWS("/app/chat.send", {
                senderId,
                receiverId: receiver.isGroup ? null : receiver.id,
                groupId: receiver.isGroup ? receiver.id : null,
                mediaUrl: uploadedUrl,
                type: type,
            });
        }
    } catch (error) {
        console.error("Media Pick Error:", error);
        Alert.alert("Error", "Could not select file.");
    }
  };

  const onType = (t) => {
    setText(t);
    if (!receiver.isBot) {
        sendWS("/app/typing", { from: senderId, to: receiver.id, typing: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0B1220" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{
              uri: receiver.isBot ? META_AI_LOGO : (receiver.profilePic ? BASE_IMG + receiver.profilePic : "https://i.pravatar.cc/100"),
            }}
            style={styles.avatar}
          />

          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={() => receiver.isGroup && navigation.navigate("GroupInfo", { groupId: receiver.id, groupName: receiver.username })}
          >
            <Text style={styles.name}>{receiver.username}</Text>
            <Text style={styles.lastSeen}>
              {typing ? "typing..." : receiver.isBot ? "AI Assistant" : "online"}
            </Text>
          </TouchableOpacity>

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
  header: { height: 60, backgroundColor: "#0A84FF", flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  lastSeen: { color: "#E5E7EB", fontSize: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#121A2F" },
  input: { flex: 1, backgroundColor: "#1F2937", borderRadius: 20, paddingHorizontal: 14, marginHorizontal: 10, color: "#fff", height: 40 },
  sendBtn: { backgroundColor: "#0A84FF", padding: 10, borderRadius: 20 },
});