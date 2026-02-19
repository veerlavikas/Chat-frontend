import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Import your API tool here (assuming you have an axios instance set up)
import api from "../api/authApi"; 

export default function ProfileSetupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Missing Info", "Please enter a username to continue.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Send the new username to your Spring Boot backend
      // (Your Axios interceptor should automatically attach the JWT token here!)
      await api.put("/api/users/profile", { username: username });

      // ✅ Once saved, drop them right into the main chat interface!
      navigation.replace("App");
      
    } catch (error) {
      console.log("Profile Update Error: ", error);
      Alert.alert("Error", "Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Almost Done!</Text>
          <Text style={styles.subtitle}>What should we call you?</Text>

          {/* Placeholder for a future profile picture feature! */}
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {username ? username.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>

          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            maxLength={25}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Start Chatting</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f6fb" },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 30, fontWeight: "bold", color: "#1e88e5", textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: 30, color: "#555", fontSize: 16 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "#e0e0e0",
    alignSelf: "center", justifyContent: "center", alignItems: "center", marginBottom: 30
  },
  avatarText: { fontSize: 40, color: "#777", fontWeight: "bold" },
  input: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: "#ddd", fontSize: 16, textAlign: "center" },
  button: { backgroundColor: "#1e88e5", padding: 16, borderRadius: 12 },
  btnText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" },
});