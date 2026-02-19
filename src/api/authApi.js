import axios from "axios";
import auth from '@react-native-firebase/auth';

const BASE_URL = "https://chat-backend-9v66.onrender.com"; // Removed /auth

export const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Automatically attach the Firebase Token to EVERY request
api.interceptors.request.use(async (config) => {
  const currentUser = auth().currentUser;
  
  if (currentUser) {
    // Get a fresh token from Firebase
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});