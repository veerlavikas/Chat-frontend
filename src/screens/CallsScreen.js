import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

const CALLS = [
  { id: 1, name: "Rahul", type: "audio", time: "Today" },
  { id: 2, name: "Anjali", type: "video", time: "Yesterday" },
];

export default function CallsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calls</Text>
      </View>

      <FlatList
        data={CALLS}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Icon
              name={
                item.type === "video"
                  ? "videocam"
                  : "call"
              }
              size={22}
              color="#0A84FF"
            />
          </View>
        )}
      />
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 0.5,
    borderColor: "#1F2937",
  },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  name: { color: "#fff", fontSize: 16 },
  time: { color: "#9CA3AF", fontSize: 12 },
});
