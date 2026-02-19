import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";

/* --- AUTH SCREENS --- */
import LoginScreen from "../screens/LoginScreen";
import OtpVerificationScreen from "../screens/OtpVerificationScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen"; // ✅ 1. Added this

/* --- MAIN SCREENS --- */
import ChatsScreen from "../screens/ChatsScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CallsScreen from "../screens/CallsScreen";
import DiscoveryScreen from "../screens/DiscoveryScreen";
import CallScreen from "../screens/CallScreen";
import ImageViewerScreen from "../screens/ImageViewerScreen";

/* --- ✅ NEW FEATURES --- */
import StatusScreen from "../screens/StatusScreen"; 
import StatusViewScreen from "../screens/StatusViewScreen"; 
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupInfoScreen from "../screens/GroupInfoScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------------- CHATS STACK ---------------- */
function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatsHome" component={ChatsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen 
        name="CreateGroup" 
        component={CreateGroupScreen} 
        options={{ headerShown: true, title: "New Group", headerStyle: { backgroundColor: "#0A84FF" }, headerTintColor: "#fff" }} 
      />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen 
        name="ImageViewer" 
        component={ImageViewerScreen} 
        options={{ headerShown: false, presentation: 'fullScreenModal' }} 
      />
    </Stack.Navigator>
  );
}

/* ---------------- UPDATES STACK ---------------- */
function UpdatesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatusHome" component={StatusScreen} />
      <Stack.Screen 
        name="StatusView" 
        component={StatusViewScreen} 
        options={{ 
            headerShown: false, 
            animation: 'fade', 
            orientation: 'portrait' 
        }} 
      />
    </Stack.Navigator>
  );
}

/* ---------------- BOTTOM TABS ---------------- */
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121A2F",
          borderTopColor: "#1F2937",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Chats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Updates") {
            iconName = focused ? "radio-button-on" : "radio-button-off"; 
          } else if (route.name === "Calls") {
            iconName = focused ? "call" : "call-outline";
          } else if (route.name === "Discovery") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatsStack} />
      <Tab.Screen name="Updates" component={UpdatesStack} />
      <Tab.Screen name="Calls" component={CallsScreen} />
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/* ---------------- ROOT NAVIGATOR ---------------- */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      {/* Auth Flow */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      
      {/* ✅ 2. NEW: Redirect here after OTP verify */}
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      
      {/* Main Application */}
      <Stack.Screen name="App" component={AppTabs} />
    </Stack.Navigator>
  );
}