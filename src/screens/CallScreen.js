import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function CallScreen({ route, navigation }) {
  const { type, user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.username}</Text>
      <Text style={styles.type}>
        {type === "video" ? "Video Call" : "Audio Call"}
      </Text>

      <TouchableOpacity
        style={styles.end}
        onPress={() => navigation.goBack()}
      >
        <Icon name="call" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { color: "#fff", fontSize: 22 },
  type: { color: "#9CA3AF", marginTop: 6 },
  end: {
    backgroundColor: "red",
    marginTop: 40,
    padding: 20,
    borderRadius: 40,
  },
});
