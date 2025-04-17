// src/apiConfig.jsx

import axios from 'axios';

// Base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Set JWT token if exists
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export { API_BASE_URL, api };
