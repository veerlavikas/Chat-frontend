import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UPDATES = [
  { id: 1, title: "Google Gemini AI", desc: "New AI features launched" },
  { id: 2, title: "Android 15", desc: "Privacy & performance upgrade" },
  { id: 3, title: "Chrome Update", desc: "Security patches released" },
];

export default function DiscoveryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discovery</Text>
      </View>

      <FlatList
        data={UPDATES}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
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

  card: {
    backgroundColor: "#121A2F",
    margin: 12,
    padding: 14,
    borderRadius: 12,
  },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardDesc: { color: "#9CA3AF", marginTop: 6 },
});
