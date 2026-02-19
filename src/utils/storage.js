import AsyncStorage from "@react-native-async-storage/async-storage";

/* AUTH */
export const saveToken = async (token) =>
  AsyncStorage.setItem("token", token);

export const getToken = async () =>
  AsyncStorage.getItem("token");

export const clearToken = async () =>
  AsyncStorage.multiRemove(["token", "profilePic"]);

/* PROFILE */
export const saveProfilePic = async (pic) =>
  AsyncStorage.setItem("profilePic", pic);

export const getProfilePic = async () =>
  AsyncStorage.getItem("profilePic");

/* CHAT SETTINGS */
export const setChatAnimation = async (v) =>
  AsyncStorage.setItem("chatAnimation", JSON.stringify(v));

export const getChatAnimation = async () => {
  const v = await AsyncStorage.getItem("chatAnimation");
  return v ? JSON.parse(v) : false;
};
