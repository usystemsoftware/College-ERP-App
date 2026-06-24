import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5050' 
  : 'http://192.168.1.10:5050';

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch (e) {
      console.log('Error fetching token for request:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized (401)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // You could handle refresh tokens here if needed
    if (error.response?.status === 401) {
      console.log('Unauthorized request. Token might be expired.');
      // Optional: Navigate to login or clear token
    }
    return Promise.reject(error);
  }
);

export const get = client.get;
export const post = client.post;
export const put = client.put;
export const patch = client.patch;
export const del = client.delete;

export default client;
