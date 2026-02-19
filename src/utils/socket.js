import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export const connectSocket = (userId, onMessage, onTyping) => {
  client = new Client({
    webSocketFactory: () => new SockJS("https://chat-backend-9v66.onrender.com/ws"),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/chat/${userId}`, (msg) => {
        onMessage(JSON.parse(msg.body));
      });

      client.subscribe(`/topic/typing/${userId}`, (msg) => {
        onTyping(JSON.parse(msg.body));
      });
    },
  });

  client.activate();
};

export const sendWS = (destination, payload) => {
  if (!client || !client.connected) return;

  client.publish({
    destination,
    body: JSON.stringify(payload),
  });
};
