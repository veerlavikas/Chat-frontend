import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { verifyAndSignup, requestOtp } from "../api/authApi";

export default function OtpVerificationScreen({ route, navigation }) {
  const { signupData } = route.params;
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30); // 30-second countdown

  // ✅ Timer Logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit OTP.");
      return;
    }

    verifyAndSignup({ ...signupData, otp })
      .then(() => {
        Alert.alert("Success", "Account created successfully!");
        navigation.replace("Login");
      })
      .catch(() => {
        Alert.alert("Verification Failed", "Incorrect or expired OTP.");
      });
  };

  const handleResend = () => {
    setTimer(30); // Reset timer
    requestOtp(signupData.phone)
      .then(() => Alert.alert("Sent", "A new OTP has been sent to your logs."))
      .catch(() => Alert.alert("Error", "Failed to resend OTP."));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.subtitle}>Enter the code sent to {signupData.phone}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="000000"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.btnText}>Verify & Register</Text>
      </TouchableOpacity>

      {/* ✅ Resend Section */}
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
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    textAlign: "center", 
    fontSize: 24, 
    letterSpacing: 10, 
    marginVertical: 20, 
    borderWidth: 1, 
    borderColor: "#ddd" 
  },
  button: { backgroundColor: "#1e88e5", padding: 16, borderRadius: 12 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  resendContainer: { marginTop: 25, alignItems: "center" },
  timerText: { color: "#777", fontSize: 14 },
  resendLink: { color: "#1e88e5", fontWeight: "bold", fontSize: 14 },
});