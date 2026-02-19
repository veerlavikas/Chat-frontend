import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Platform 
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://chat-backend-9v66.onrender.com";

export default function CreateGroupScreen({ navigation, route }) {
  // Ensure we get myId from route params or fallback to a default if testing
  const { myId } = route.params || { myId: 1 }; 
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]); 
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      // ✅ Calls the new endpoint we added to UserController.java
      const res = await axios.get(`${BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter out yourself so you don't add yourself to the "selection" list
      const filteredUsers = res.data.filter(u => u.id !== myId);
      setUsers(filteredUsers);
    } catch (err) {
      console.log("Error fetching users:", err.response?.status || err.message);
      Alert.alert("Error", "Could not load the contacts.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      return Alert.alert("Error", "Enter a name and select at least 1 member.");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        name: groupName,
        adminId: myId,
        memberIds: [...selectedUsers, myId], // Add self as a member
        groupIcon: null
      };

      await axios.post(`${BASE_URL}/api/groups/create`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert("Success", "Group Created!");
      navigation.navigate("ChatsHome"); 
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not create group");
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Group Subject Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconBox}>
           <Icon name="camera" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TextInput 
          placeholder="Group Subject" 
          placeholderTextColor="#9CA3AF"
          style={styles.input} 
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <Text style={styles.subHeader}>Select Participants</Text>

      {/* 2. User List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0A84FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedUsers.includes(item.id);
            return (
              <TouchableOpacity style={styles.userRow} onPress={() => toggleSelect(item.id)}>
                <Image 
                  source={{ 
                    uri: item.profilePic 
                      ? `${BASE_URL}/uploads/profile/${item.profilePic}` 
                      : "https://i.pravatar.cc/100" 
                  }} 
                  style={styles.avatar} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.username}</Text>
                  <Text style={styles.status} numberOfLines={1}>
                    {item.status || "Hey there! I am using ChatApp."}
                  </Text>
                </View>
                <Icon 
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                  size={26} 
                  color={isSelected ? "#008069" : "#4B5563"} 
                />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No contacts found</Text>}
        />
      )}

      {/* 3. Create Button (FAB) */}
      {selectedUsers.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreate}>
          <Icon name="arrow-forward" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  inputContainer: { 
    flexDirection: "row", 
    padding: 20, 
    alignItems: "center", 
    backgroundColor: "#121A2F",
    paddingTop: Platform.OS === "ios" ? 60 : 20 
  },
  iconBox: { 
    width: 55, height: 55, borderRadius: 27.5, backgroundColor: "#1F2937", 
    justifyContent: "center", alignItems: "center", marginRight: 15 
  },
  input: { flex: 1, fontSize: 18, color: "#fff", borderBottomWidth: 1, borderBottomColor: "#0A84FF", paddingVertical: 8 },
  subHeader: { padding: 15, color: "#0A84FF", fontWeight: "bold", fontSize: 12, textTransform: 'uppercase' },
  userRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff" },
  status: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  emptyText: { textAlign: 'center', color: "#9CA3AF", marginTop: 40 },
  fab: {
    position: "absolute", bottom: 30, right: 30,
    backgroundColor: "#0A84FF", width: 60, height: 60,
    borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 8
  }
});