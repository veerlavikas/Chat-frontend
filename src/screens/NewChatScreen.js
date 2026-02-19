import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { searchUsers } from "../api/userApi";

const BASE_IMG =
  "https://chat-backend-9v66.onrender.com/uploads/profile/";

export default function NewChatScreen({ route, navigation }) {
  const { me } = route.params;
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const onSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) {
      setUsers([]);
      return;
    }
    const res = await searchUsers(text);
    setUsers(res.filter((u) => u.id !== me.id));
  };

  const startChat = () => {
  if (!selectedUser) return;

  navigation.replace("Chat", {
  senderId: me.id,
  receiver: {
    id: selectedUser.id,
    username: selectedUser.username,
    profilePic: selectedUser.profilePic,
  },
});

};


  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New chat</Text>

        <TouchableOpacity
          onPress={startChat}
          disabled={!selectedUser}
        >
          <Text
            style={[
              styles.start,
              !selectedUser && { opacity: 0.4 },
            ]}
          >
            Start
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Text style={styles.to}>To:</Text>
        <TextInput
          placeholder="Search name or number"
          placeholderTextColor="#999"
          value={query}
          onChangeText={onSearch}
          style={styles.search}
        />
      </View>

      {/* USERS */}
      <FlatList
        data={users}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.row,
              selectedUser?.id === item.id &&
                styles.selectedRow,
            ]}
            onPress={() => setSelectedUser(item)}
          >
            <Image
              source={{
                uri: item.profilePic
                  ? BASE_IMG + item.profilePic
                  : "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  cancel: { color: "#0A84FF", fontSize: 16 },
  title: { color: "#fff", fontSize: 18 },
  start: { color: "#0A84FF", fontSize: 16 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },
  to: { color: "#aaa", marginRight: 6 },
  search: { color: "#fff", flex: 1 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  selectedRow: {
    backgroundColor: "#1f2c34",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { color: "#fff", fontSize: 16 },
});
