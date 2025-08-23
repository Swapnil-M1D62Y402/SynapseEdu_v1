// // src/app/api/api.ts
// import axios, { AxiosInstance } from "axios";

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// const api: AxiosInstance = axios.create({
//   baseURL: BASE_URL,
//   timeout: 20000,
//   headers: { "Content-Type": "application/json" },
// });

// // Attach token automatically to outgoing requests (client-side only)
// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined" && config.headers) {
//     const token = localStorage.getItem("auth_token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (err) => Promise.reject(err));

// // Global 401 handling: clear local auth (optional redirect left to UI/hook)
// api.interceptors.response.use((res) => res, (err) => {
//   const status = err?.response?.status;
//   if (status === 401 && typeof window !== "undefined") {
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("auth_user");
//     // Note: we don't redirect here — let the hook/UI handle navigation
//   }
//   return Promise.reject(err);
// });

// /* ----------------------
//    Types
//    ---------------------- */
// export type User = {
//   id: string;
//   name?: string | null;
//   email?: string | null;
// };

// /* ----------------------
//    Auth helpers (simple + explicit)
//    ---------------------- */
// export const authApi = {
//   // Register: calls backend POST /api/auth/register
//   // returns the backend JSON (e.g. { id, name, email, token })

//     signup: async (payload: { name?: string; email: string; password: string }) => {
//     const res = await api.post("/auth/register", payload);
//     return res.data;
//     },

//   register: async (payload: { name?: string; email: string; password: string }) => {
//     const res = await api.post("/auth/register", payload);
//     return res.data;
//   },

//   // Login: calls backend POST /api/auth/login
//   // returns the backend JSON (e.g. { id, name, email, token })
//   login: async (payload: { email: string; password: string }) => {
//     const res = await api.post("/auth/login", payload);
//     return res.data;
//   },

//   // Optional: if you later implement server-side logout endpoint
//   logoutBackend: async () => {
//     return api.post("/auth/logout");
//   },

//   // Client-only helpers
//   logoutClientOnly: () => {
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("auth_user");
//   },

//   storeAuthLocally: (token: string, user: User) => {
//     localStorage.setItem("auth_token", token);
//     localStorage.setItem("auth_user", JSON.stringify(user));
//   },
// };

// // src/app/api/studyKitClient.ts (or inside your existing api.ts exports)
// export const studyKitApi = {
//   createStudyKit: async (payload: { name: string, studyGuideSummary?: string }) => {
//     const res = await api.post('/studyKit', payload);
//     return res.data;
//   },

//   uploadSources: async (studyKitId: string, files: File[]) => {
//     const form = new FormData();
//     form.append('studyKitId', studyKitId);
//     files.forEach(f => form.append('files', f)); // 'files' matches upload.array('files')

//     // override content-type so axios will set boundary
//     const res = await api.post('/studyKit/source', form, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
//     return res.data;
//   },

//   addLinkSource: async (studyKitId: string, url: string, kind = 'link') => {
//     // you need to implement an endpoint to accept links (see note below)
//     const res = await api.post('/studyKit/source/link', { studyKitId, url, kind });
//     return res.data;
//   },

//   addTextSource: async (studyKitId: string, text: string) => {
//     const res = await api.post('/studyKit/source/text', { studyKitId, text });
//     return res.data;
//   }
// };

// export default api;


// src/app/api/api.ts
import axios, { AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically to outgoing requests (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && config.headers) {
    const token = localStorage.getItem("auth_token");
    console.log("Token from localStorage:", token ? "Found" : "Not found"); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set"); // Debug log
    }
  }
  console.log("Request URL:", config.url); // Debug log
  console.log("Request headers:", config.headers); // Debug log
  return config;
}, (err) => Promise.reject(err));

// Global 401 handling: clear local auth
api.interceptors.response.use((res) => res, (err) => {
  const status = err?.response?.status;
  console.log("Response error status:", status); // Debug log
  console.log("Response error data:", err?.response?.data); // Debug log
  
  if (status === 401 && typeof window !== "undefined") {
    console.log("Clearing auth tokens due to 401");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
  return Promise.reject(err);
});

export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export const authApi = {
  signup: async (payload: { name?: string; email: string; password: string }) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  register: async (payload: { name?: string; email: string; password: string }) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  logoutBackend: async () => {
    return api.post("/auth/logout");
  },

  logoutClientOnly: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  storeAuthLocally: (token: string, user: User) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },
};

export const studyKitApi = {
  createStudyKit: async (payload: { name: string; studyGuideSummary?: string }) => {
    const res = await api.post('/studyKit', payload);
    return res.data;
  },

  uploadSources: async (studyKitId: string, files: File[]) => {
    const form = new FormData();
    form.append('studyKitId', studyKitId);
    files.forEach(f => form.append('files', f));

    // CRITICAL FIX: Don't set Content-Type manually for FormData
    // Let axios set it automatically with the boundary
    const res = await api.post('/studyKit/source', form);
    return res.data;
  },

  addLinkSource: async (studyKitId: string, url: string, kind = 'link') => {
    const res = await api.post('/studyKit/source/link', { studyKitId, url, kind });
    return res.data;
  },

  addTextSource: async (studyKitId: string, text: string, title?: string) => {
    const res = await api.post('/studyKit/source/text', { studyKitId, text, title });
    return res.data;
  }
};

export default api;
