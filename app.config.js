module.exports = {
  expo: {
    name: "chat-frontend",
    slug: "chat-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.vikas.Chatapp",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON
    },
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ],
    extra: {
      eas: {
        projectId: "df207cff-6a07-4ee3-a455-b196be3259ac"
      }
    }
  }
};
