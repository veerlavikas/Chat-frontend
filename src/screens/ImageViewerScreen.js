import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function ImageViewerScreen({ route, navigation }) {
  const { uri } = route.params; // Get the image URL passed from ChatScreen

  return (
    <View style={styles.container}>
      <StatusBar hidden /> {/* Hide status bar for full immersion */}
      
      {/* Close Button */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Icon name="close" size={30} color="#fff" />
      </TouchableOpacity>

      {/* The Full Image */}
      <Image 
        source={{ uri: uri }} 
        style={styles.image} 
        resizeMode="contain" // Keeps aspect ratio correct
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  closeBtn: {
    position: "absolute", top: 40, right: 20, zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 5
  }
});