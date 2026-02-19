import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as Audio from "expo-av";
import { sendMessage } from "../api/chatApi";

export default function ChatInput({ senderId, receiverId, onSend }) {
  const [text, setText] = useState("");

  const send = async (mediaUrl = null) => {
    const msg = await sendMessage({
      senderId,
      receiverId,
      content: text,
      mediaUrl,
    });
    onSend(msg);
    setText("");
  };

  return (
    <View style={{ flexDirection: "row", padding: 8 }}>
      <TouchableOpacity onPress={pickMedia}>
        <Icon name="attach" size={22} />
      </TouchableOpacity>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message"
        style={{ flex: 1, marginHorizontal: 10 }}
      />

      <TouchableOpacity onPress={() => send()}>
        <Icon name="send" size={22} color="#075E54" />
      </TouchableOpacity>
    </View>
  );
}

const pickMedia = async () => {
  await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
  });
};
