import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { getMyProfile, uploadProfilePic } from "../api/userApi";
import {
  getChatAnimation,
  setChatAnimation,
  saveProfilePic,
  getProfilePic,
  clearToken,
} from "../utils/storage";

const BASE_IMG =
  "https://chat-backend-9v66.onrender.com/uploads/profile/";

export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [dp, setDp] = useState(null);
  const [chatAnim, setChatAnim] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const p = await getMyProfile();
    setProfile(p);

    const savedDp = await getProfilePic();
    if (savedDp) {
      setDp(BASE_IMG + savedDp);
    } else if (p?.profilePic) {
      setDp(BASE_IMG + p.profilePic);
      saveProfilePic(p.profilePic);
    }

    setChatAnim(await getChatAnimation());
  };

  /* ---------------- CHANGE PROFILE DP ---------------- */
  const changeDP = async () => {
  if (uploading) return;

  Alert.alert(
    "Change profile photo",
    "Choose an option",
    [
      {
        text: "Camera",
        onPress: openCamera,
      },
      {
        text: "Gallery",
        onPress: openGallery,
      },
      { text: "Cancel", style: "cancel" },
    ]
  );
};

const openGallery = async () => {
  const perm =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (perm.status !== "granted") {
    Alert.alert("Permission denied");
    return;
  }

  if (perm.accessPrivileges === "limited") {
    Alert.alert(
      "Limited Photos Access",
      "Please allow access to all photos from Settings",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => ImagePicker.openSettings(),
        },
      ]
    );
    return;
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!res.canceled) handleImage(res.assets[0]);
};


const openCamera = async () => {
  const { status } =
    await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission required",
      "Allow camera access from settings"
    );
    return;
  }

  const res = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!res.canceled) handleImage(res.assets[0]);
};

const handleImage = async (image) => {
  try {
    setUploading(true);

    // preview
    setDp(image.uri);

    // upload
    const response = await uploadProfilePic(image);
    await saveProfilePic(response.profilePic);

    setDp(BASE_IMG + response.profilePic);
  } catch {
    Alert.alert("Upload failed");
  } finally {
    setUploading(false);
  }
};

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearToken();
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* PROFILE */}
      <TouchableOpacity style={styles.profile} onPress={changeDP}>
        <Image
          source={{ uri: dp || "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.name}>{profile?.username}</Text>
          <Text style={styles.sub}>
            {uploading ? "Uploading..." : "Tap to change profile photo"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* CHAT SETTINGS */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.option}>Animated Chat Background</Text>
          <Switch
            value={chatAnim}
            onValueChange={(v) => {
              setChatAnim(v);
              setChatAnimation(v);
            }}
          />
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },

  header: {
    height: 56,
    backgroundColor: "#0A84FF",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },

  profile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#121A2F",
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  name: { color: "#fff", fontSize: 18, fontWeight: "600" },
  sub: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },

  section: {
    marginTop: 20,
    backgroundColor: "#121A2F",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  option: { color: "#fff", fontSize: 16 },

  logout: {
    marginTop: 30,
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
