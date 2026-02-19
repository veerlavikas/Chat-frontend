import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "https://chat-backend-9v66.onrender.com/api";

const auth = async () => ({
  Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
});

// ✅ ADDED: Professional Media Upload Function
export const uploadMediaApi = async (asset) => {
  const formData = new FormData();
  
  // Format for React Native File Upload
  formData.append("file", {
    uri: asset.uri,
    name: asset.name || `file_${Date.now()}`,
    type: asset.mimeType || "image/jpeg", 
  });

  const res = await axios.post(`${BASE}/media/upload`, formData, {
    headers: {
      ...(await auth()),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data; // Returns the filename or URL from Spring Boot
};

export const fetchChatHistory = async (me, other) => {
  const res = await axios.get(`${BASE}/chat/history/${me}/${other}`, {
    headers: await auth(),
  });
  return res.data;
};

export const getChats = async (myId) => {
  const res = await axios.get(`${BASE}/chat/chats/${myId}`, {
    headers: await auth(),
  });
  return res.data;
};

export const sendMessage = async (data) => {
  const res = await axios.post(`${BASE}/chat/send`, data, {
    headers: await auth(),
  });
  return res.data;
};