import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

export default function OtpVerificationScreen({ route, navigation }) {
  // ✅ Get the confirmation object and phone number passed from LoginScreen
  const { confirmation, phone } = route.params;
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 1. Send the 6 digits to Firebase to verify
      const userCredential = await confirmation.confirm(otp);
      
      // ✅ 2. Grab the JWT Token from Firebase
      const idToken = await userCredential.user.getIdToken();
      
      // ✅ 3. Save it securely so your Axios interceptor can use it
      await AsyncStorage.setItem("userToken", idToken);
      await AsyncStorage.setItem("firebaseUid", userCredential.user.uid);
      await AsyncStorage.setItem("userPhone", phone);

      // ✅ 4. Navigate to your Main App! 
      // (Your backend's JwtFilter will auto-register them on their first API call)
      navigation.replace("ProfileSetup"); 

    } catch (error) {
      console.log("OTP Error: ", error);
      // ✅ Show the exact error message from Firebase!
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    try {
      // ✅ Use Firebase to resend the SMS
      const newConfirmation = await auth().signInWithPhoneNumber(phone);
      // Update the confirmation object in route params behind the scenes
      navigation.setParams({ confirmation: newConfirmation });
      Alert.alert("Sent", "A new OTP has been sent to your phone.");
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="000000"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        editable={!loading}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        {timer > 0 ? (
          <Text style={styles.timerText}>Resend code in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f6fb", padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1e88e5", textAlign: "center" },
  subtitle: { textAlign: "center", marginVertical: 10, color: "#555" },
  input: { 
    backgroundColor: "#fff", padding: 15, borderRadius: 10, textAlign: "center", 
    fontSize: 24, letterSpacing: 10, marginVertical: 20, borderWidth: 1, borderColor: "#ddd" 
  },
  button: { backgroundColor: "#1e88e5", padding: 16, borderRadius: 12 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  resendContainer: { marginTop: 25, alignItems: "center" },
  timerText: { color: "#777", fontSize: 14 },
  resendLink: { color: "#1e88e5", fontWeight: "bold", fontSize: 14 },
});