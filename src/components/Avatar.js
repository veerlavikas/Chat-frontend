
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

export default function Avatar({ uri, name, size = 46 }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.empty,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.initial}>
        {name ? name[0].toUpperCase() : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: "#1e88e5",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
