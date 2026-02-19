import axios from "axios";

const BASE_URL = "https://chat-backend-9v66.onrender.com/auth";

// Step 1: Request the OTP
export const requestOtp = (phone) => {
  return axios.post(`${BASE_URL}/send-otp`, { phone });
};

// Step 2: Verify OTP and Create User
export const verifyAndSignup = (data) => {
  return axios.post(`${BASE_URL}/verify-signup`, data);
};

export const login = (data) => {
  return axios.post(`${BASE_URL}/login`, data);
};