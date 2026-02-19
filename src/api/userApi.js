import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "https://chat-backend-9v66.onrender.com/api";

const auth = async () => ({
  Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
});

export const getMyProfile = async () => {
  const res = await axios.get(`${BASE}/users/me`, {
    headers: await auth(),
  });
  return res.data;
};

export const searchUsers = async (query) => {
  const res = await axios.get(
    `${BASE}/users/search?q=${query}`,
    { headers: await auth() }
  );
  return res.data;
};

/* ✅ DP UPLOAD — MATCHES BACKEND */
export const uploadProfilePic = async (image) => {
  const formData = new FormData();

  formData.append("file", {
    uri: image.uri.startsWith("file://")
      ? image.uri
      : `file://${image.uri}`,
    name: `profile_${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  const res = await axios.post(
    `${BASE}/users/upload-dp`,
    formData,
    { headers: await auth() }
  );

  return res.data; // { message, profilePic }
};
