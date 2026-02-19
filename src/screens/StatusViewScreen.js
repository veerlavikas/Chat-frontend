import React, { useState, useEffect } from "react";
import { 
  View, Image, StyleSheet, TextInput, TouchableOpacity, Text, 
  KeyboardAvoidingView, Platform, FlatList 
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://chat-backend-9v66.onrender.com"; 

export default function StatusViewScreen({ route, navigation }) {
  const { status, me } = route.params;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!showComments) {
      const timer = setTimeout(() => navigation.goBack(), 8000);
      return () => clearTimeout(timer);
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/status/${status.id}/comments`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) { console.log("Comment Fetch Error", err.response?.status); }
  };

  const sendComment = async () => {
    if (!comment.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const payload = { userId: me.id, username: me.username, content: comment };
      await axios.post(`${BASE_URL}/api/status/${status.id}/comment`, payload, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setComment("");
      fetchComments();
    } catch (err) { console.log("Post Comment Error", err.response?.status); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "black" }}>
      <Image source={{ uri: status.mediaUrl }} style={styles.image} resizeMode="contain" />

      {/* ✅ TOP NOTCH ALIGNMENT FIXED */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerContent} onPress={() => navigation.goBack()}>
           <Icon name="arrow-back" size={24} color="#fff" />
           <Text style={styles.username}>{status.username}</Text>
        </TouchableOpacity>
        <Icon name="ellipsis-vertical" size={22} color="#fff" />
      </View>

      {showComments && (
        <View style={styles.commentsOverlay}>
          <Text style={styles.commentHeader}>Comments</Text>
          <FlatList
            data={comments}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <View style={styles.commentItem}>
                <Text style={styles.commentUser}>{item.username}</Text>
                <Text style={styles.commentContent}>{item.content}</Text>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => { setShowComments(!showComments); if(!showComments) fetchComments(); }}>
          <Icon name={showComments ? "chevron-down" : "chevron-up"} size={30} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Reply..."
          placeholderTextColor="#ccc"
          value={comment}
          onChangeText={setComment}
          onFocus={() => { setShowComments(true); fetchComments(); }}
        />
        <TouchableOpacity onPress={sendComment}><Icon name="send" size={24} color="#38BDF8" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: "100%", position: "absolute" },
  header: { 
    position: "absolute", 
    top: Platform.OS === "ios" ? 60 : 40, 
    left: 20, 
    right: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  username: { color: "#fff", fontSize: 18, marginLeft: 10, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  input: { flex: 1, color: "#fff", borderColor: "#fff", borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, height: 40, marginHorizontal: 10 },
  commentsOverlay: { position: "absolute", bottom: 90, left: 0, right: 0, height: 250, backgroundColor: "rgba(0,0,0,0.9)", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  commentHeader: { color: '#fff', fontWeight: 'bold', marginBottom: 15 },
  commentItem: { marginBottom: 10 },
  commentUser: { color: '#38BDF8', fontWeight: 'bold', fontSize: 13 },
  commentContent: { color: '#fff', fontSize: 14 }
});