// src/app/api/api.ts
import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically to outgoing requests (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && config.headers) {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// Global 401 handling: clear local auth (optional redirect left to UI/hook)
api.interceptors.response.use((res) => res, (err) => {
  const status = err?.response?.status;
  if (status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    // Note: we don't redirect here — let the hook/UI handle navigation
  }
  return Promise.reject(err);
});

/* ----------------------
   Types
   ---------------------- */
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
};

/* ----------------------
   Auth helpers (simple + explicit)
   ---------------------- */
export const authApi = {
  // Register: calls backend POST /api/auth/register
  // returns the backend JSON (e.g. { id, name, email, token })

    signup: async (payload: { name?: string; email: string; password: string }) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
    },

  register: async (payload: { name?: string; email: string; password: string }) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  // Login: calls backend POST /api/auth/login
  // returns the backend JSON (e.g. { id, name, email, token })
  login: async (payload: { email: string; password: string }) => {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  // Optional: if you later implement server-side logout endpoint
  logoutBackend: async () => {
    return api.post("/auth/logout");
  },

  // Client-only helpers
  logoutClientOnly: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  storeAuthLocally: (token: string, user: User) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },
};

export default api;
