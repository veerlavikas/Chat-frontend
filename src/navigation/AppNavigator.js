import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";

/* AUTH */
import LoginScreen from "../screens/LoginScreen";
import OtpVerificationScreen from "../screens/OtpVerificationScreen";
import SignupScreen from "../screens/SignupScreen";

/* APP */
import ChatsScreen from "../screens/ChatsScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CallsScreen from "../screens/CallsScreen";
import DiscoveryScreen from "../screens/DiscoveryScreen";
import CallScreen from "../screens/CallScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------------- CHATS STACK ---------------- */
function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatsHome" component={ChatsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );
}

/* ---------------- TABS ---------------- */
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121A2F",
          borderTopColor: "#1F2937",
        },
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Chats: "chatbubble",
            Calls: "call",
            Discovery: "compass",
            Settings: "settings",
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatsStack} />
      <Tab.Screen name="Calls" component={CallsScreen} />
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/* ---------------- ROOT STACK ---------------- */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      {/* AUTH */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

      {/* MAIN APP */}
      <Stack.Screen name="App" component={AppTabs} />
    </Stack.Navigator>
  );
}
