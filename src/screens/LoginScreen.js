import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import auth from '@react-native-firebase/auth';

export default function LoginScreen({ navigation }) {
  // ✅ Notice: Password is gone!
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();
  }, []);

  const handleSendOtp = async () => {
    if (!phone) {
      Alert.alert("Error", "Please enter your phone number.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Firebase sends the SMS directly!
      // Format must include country code (e.g., +919999999999)
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      
      // ✅ Pass the Firebase confirmation object to the OTP Screen
      navigation.navigate("OtpVerification", { 
        confirmation, 
        phone: formattedPhone 
      });
      
    } catch (error) {
      console.log("Firebase Error: ", error);
      // ✅ This is the magic line we need!
      Alert.alert("Firebase Error", error.message);
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
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>

          <TextInput
            placeholder="Phone number (e.g., 9876543210)"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSendOtp} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f6fb" },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 30, fontWeight: "bold", color: "#1e88e5", textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: 30, color: "#555" },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: "#ddd" },
  button: { backgroundColor: "#1e88e5", padding: 16, borderRadius: 12, marginTop: 10 },
  btnText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
});