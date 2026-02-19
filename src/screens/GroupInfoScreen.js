import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator 
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://chat-backend-9v66.onrender.com"; 

export default function GroupInfoScreen({ route, navigation }) {
  const { groupId, groupName, groupIcon } = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    loadGroupInfo();
  }, []);

  const loadGroupInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId"); // Ensure you store this on login
      setMyId(parseInt(userId));

      const res = await axios.get(`${BASE_URL}/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (err) {
      console.log("Error fetching group members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExitGroup = () => {
    Alert.alert("Exit Group", `Leave "${groupName}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.post(`${BASE_URL}/api/groups/${groupId}/leave`, { userId: myId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigation.navigate("ChatsHome");
          } catch (err) { Alert.alert("Error", "Could not leave group"); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: groupIcon ? `${BASE_URL}/uploads/groups/${groupIcon}` : "https://i.pravatar.cc/300" }} 
          style={styles.groupIcon} 
        />
        <Text style={styles.title}>{groupName}</Text>
        <Text style={styles.subtitle}>{members.length} participants</Text>
      </View>

      <Text style={styles.sectionTitle}>Participants</Text>
      
      {loading ? <ActivityIndicator size="large" color="#0A84FF" /> : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <Image source={{ uri: item.profilePic ? `${BASE_URL}/uploads/profile/${item.profilePic}` : "https://i.pravatar.cc/100" }} style={styles.avatar} />
              <View style={{flex: 1}}>
                <Text style={styles.memberName}>{item.username} {item.id === myId ? "(You)" : ""}</Text>
                <Text style={styles.status}>{item.isAdmin ? "Group Admin" : "Available"}</Text>
              </View>
              {item.isAdmin && <View style={styles.adminBadge}><Text style={styles.adminText}>Admin</Text></View>}
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.exitBtn} onPress={handleExitGroup}>
        <Icon name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.exitText}>Exit Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  header: { alignItems: "center", padding: 30, backgroundColor: "#121A2F" },
  groupIcon: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { color: "#9CA3AF", marginTop: 5 },
  sectionTitle: { padding: 15, color: "#0A84FF", fontWeight: "bold", textTransform: 'uppercase', fontSize: 12 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 },
  memberName: { fontSize: 16, fontWeight: "500", color: "#fff" },
  status: { color: "#9CA3AF", fontSize: 12 },
  adminBadge: { backgroundColor: "#065f46", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  adminText: { color: "#34D399", fontSize: 10, fontWeight: "bold" },
  exitBtn: { flexDirection: "row", alignItems: "center", padding: 20, marginTop: 20, borderTopWidth: 1, borderTopColor: "#1F2937" },
  exitText: { color: "#FF3B30", fontSize: 16, fontWeight: "600", marginLeft: 15 }
});