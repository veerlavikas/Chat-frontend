import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  Alert, ActivityIndicator, Platform 
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { getMyProfile } from "../api/userApi";

const BASE_URL = "https://chat-backend-9v66.onrender.com"; 

export default function StatusScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [me, setMe] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isFocused) loadData(); }, [isFocused]);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const profile = await getMyProfile();
      setMe(profile);

      const res = await axios.get(`${BASE_URL}/api/status/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatuses(res.data);
    } catch (err) {
      console.log("Load Status Error:", err.response?.status || err.message);
    }
  };

  const handleAddStatus = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Denied", "Need gallery access.");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) uploadStatus(result.assets[0]);
  };

  const uploadStatus = async (asset) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "android" ? asset.uri : asset.uri.replace("file://", ""),
        type: "image/jpeg",
        name: "status.jpg",
      });
      formData.append("userId", me.id);
      formData.append("username", me.username);

      await axios.post(`${BASE_URL}/api/status/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        },
      });
      loadData(); 
    } catch (err) {
      Alert.alert("Error", "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    Alert.alert("Delete Status", "Delete this update?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          await axios.delete(`${BASE_URL}/api/status/${statusId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          loadData();
        } catch (err) { Alert.alert("Error", "Could not delete"); }
      }}
    ]);
  };

  const myStatus = statuses.find(s => s.userId === me?.id);
  const otherStatuses = statuses.filter(s => s.userId !== me?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Updates</Text></View>

      <View style={styles.myStatusSection}>
        <TouchableOpacity 
          style={styles.row} 
          onPress={() => myStatus ? navigation.navigate("StatusView", { status: myStatus, me }) : handleAddStatus()}
        >
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: myStatus ? myStatus.mediaUrl : (me?.profilePic ? `${BASE_URL}/uploads/profile/${me.profilePic}` : "https://i.pravatar.cc/150") }} 
              style={[styles.avatar, myStatus && styles.activeBorder]} 
            />
            {!myStatus && <View style={styles.plusIcon}><Icon name="add" size={16} color="#fff" /></View>}
            {loading && <ActivityIndicator size="small" color="#fff" style={styles.loadingOverlay} />}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>My Status</Text>
            <Text style={styles.subText}>{myStatus ? "Tap to view" : "Tap to add status update"}</Text>
          </View>
        </TouchableOpacity>

        {myStatus && (
          <TouchableOpacity onPress={() => handleDeleteStatus(myStatus.id)} style={styles.editBtn}>
            <Icon name="ellipsis-vertical" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionHeader}>Recent updates</Text>
      <FlatList
        data={otherStatuses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("StatusView", { status: item, me })}>
            <View style={[styles.avatarContainer, styles.statusBorder]}>
              <Image source={{ uri: item.mediaUrl }} style={styles.avatar} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.subText}>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  header: { padding: 16, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  myStatusSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 20, flex: 1 },
  avatarContainer: { position: "relative" },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: "#333" },
  activeBorder: { borderWidth: 2, borderColor: "#0A84FF" },
  plusIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#0A84FF", width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0B1220" },
  statusBorder: { borderWidth: 2, borderColor: "#008069", borderRadius: 30, padding: 2 },
  textContainer: { marginLeft: 15 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff" },
  subText: { color: "#9CA3AF" },
  sectionHeader: { color: "#9CA3AF", fontWeight: "600", marginBottom: 15, paddingHorizontal: 16 },
  editBtn: { padding: 10 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 27.5, justifyContent: 'center', alignItems: 'center' }
});