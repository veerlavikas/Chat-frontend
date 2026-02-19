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

const BASE_IMG = "https://chat-backend-9v66.onrender.com/uploads/profile/";

// 🟣 Meta AI Logo
const META_AI_LOGO = "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png";

export default function ChatsScreen({ navigation }) {
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);

  const load = async () => {
    const profile = await getMyProfile();
    setMe(profile);
    const list = await getChats(profile.id);
    setChats(list || []);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const openChat = (item) => {
    // Check if it's a Group or Private Chat
    navigation.navigate("Chat", {
      senderId: me.id,
      receiver: {
        id: item.userId || item.groupId, // Handle both User ID and Group ID
        username: item.username || item.groupName, // Handle Group Name
        profilePic: item.profilePic || item.groupIcon,
        isGroup: !!item.groupId // Flag to tell ChatScreen this is a group
      },
    });
  };

  // 🤖 Open Meta AI
  const openMetaAI = () => {
    if (!me) return;
    navigation.navigate("Chat", {
      senderId: me.id,
      receiver: { id: 9999, username: "Meta AI", profilePic: null, isBot: true },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ UPDATED HEADER WITH "NEW GROUP" BUTTON */}
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        
        <View style={styles.headerIcons}>
          {/* 👥 NEW GROUP BUTTON */}
          <TouchableOpacity 
            onPress={() => navigation.navigate("CreateGroup", { myId: me?.id })}
            style={styles.iconBtn}
          >
            <Icon name="people" size={24} color="#fff" />
          </TouchableOpacity>

          {/* 🔍 SEARCH BUTTON (Existing) */}
          <TouchableOpacity onPress={() => navigation.navigate("NewChat", { me })}>
            <Icon name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item, index) =>
          item.chatId ? item.chatId.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>
            <Image
              source={{
                uri: item.profilePic
                  ? BASE_IMG + item.profilePic
                  : "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.username || item.groupName}</Text>
                  <Text style={styles.time}>{item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</Text>
              </View>
              <Text style={styles.last} numberOfLines={1}>
                {item.lastMessage || "Tap to chat"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No chats yet</Text>}
      />

      {/* 🟣 Meta AI Button */}
      <TouchableOpacity style={styles.aiFab} onPress={openMetaAI}>
         <Image source={{ uri: META_AI_LOGO }} style={{ width: 28, height: 28 }} resizeMode="contain" />
      </TouchableOpacity>

      {/* 🟢 Standard New Chat FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NewChat", { me })}>
        <Icon name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  header: {
    height: 60,
    backgroundColor: "#0A84FF",
    flexDirection: "row",
    justifyContent: "space-between", // Pushes Title left, Icons right
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 4,
  },
  headerIcons: {
    flexDirection: 'row', // Aligns icons horizontally
    alignItems: 'center'
  },
  iconBtn: {
    marginRight: 20 // Space between Group Icon and Search Icon
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  
  row: { flexDirection: "row", padding: 16, alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#333' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff" },
  time: { fontSize: 12, color: "#9CA3AF" },
  last: { color: "#9CA3AF", fontSize: 14 },
  empty: { textAlign: "center", marginTop: 50, color: "#9CA3AF" },

  fab: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#0A84FF", width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 6 },
  aiFab: { position: "absolute", bottom: 90, right: 25, backgroundColor: "#fff", width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", elevation: 6 }
});