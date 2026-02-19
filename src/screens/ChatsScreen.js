import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";

import { getMyProfile } from "../api/userApi";
import { getChats } from "../api/chatApi";

const BASE_IMG =
  "https://chat-backend-9v66.onrender.com/uploads/profile/";

export default function ChatsScreen({ navigation }) {
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);

  const load = async () => {
    const profile = await getMyProfile();
    setMe(profile);
    const list = await getChats(profile.id);
    setChats(list || []);
  };

  /* ✅ REFRESH ON SCREEN FOCUS */
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const openChat = (item) => {
    navigation.navigate("Chat", {
      senderId: me.id,
      receiver: {
        id: item.userId,
        username: item.username,
        profilePic: item.profilePic,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("NewChat", { me })}
        >
          <Icon name="chatbubble-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item, index) =>
          item.chatId
            ? item.chatId.toString()
            : index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => openChat(item)}
          >
            <Image
              source={{
                uri: item.profilePic
                  ? BASE_IMG + item.profilePic
                  : "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.last}>
                {item.lastMessage || "Tap to chat"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No chats yet</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  header: {
    height: 56,
    backgroundColor: "#0A84FF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },

  row: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 0.5,
    borderColor: "#1F2937",
    alignItems: "center",
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff" },
  last: { color: "#9CA3AF", marginTop: 2 },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#9CA3AF",
  },
});
