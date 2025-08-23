"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api/api"; // your axios-based api helper

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export type User = {
  id: string;
  name?: string;
  email?: string;
};

type UseAuthReturn = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string | undefined, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

function normalizeAuthResponse(data: any) {
  // Accept either:
  // { token, user: { id, name, email } }  OR  { id, name, email, token }
  const token = data?.token ?? data?.accessToken ?? null;

  let user: User | null = null;
  if (data?.user) {
    user = {
      id: String(data.user.id),
      name: data.user.name ?? data.user.username ?? undefined,
      email: data.user.email ?? undefined,
    };
  } else if (data?.id) {
    user = {
      id: String(data.id),
      name: data.name ?? data.username ?? undefined,
      email: data.email ?? undefined,
    };
  }

  return { token, user };
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // refreshUser now only reads localStorage (no /auth/me)
  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUserStr = localStorage.getItem(AUTH_USER_KEY);

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setToken(storedToken);

      if (storedUserStr) {
        try {
          const parsed = JSON.parse(storedUserStr) as User;
          setUser(parsed);
        } catch {
          // invalid stored user, clear both
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          setUser(null);
          setToken(null);
        }
      } else {
        // token exists but no stored user — keep token but user null
        setUser(null);
      }
    } catch (e: any) {
      console.error("refreshUser error:", e);
      setError("Unable to refresh user");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const login = useCallback(async (email: string, password: string) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const data = await authApi.login({ email, password });
  //     // normalize response
  //     const { token: tk, user: u } = normalizeAuthResponse(data);

  //     if (!tk || !u) {
  //       throw new Error("Invalid login response from server");
  //     }

  //     // persist
  //     localStorage.setItem(AUTH_TOKEN_KEY, tk);
  //     localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));

  //     setToken(tk);
  //     setUser(u);
  //   } catch (err: any) {
  //     console.error("login error", err);
  //     setError(err?.response?.data?.message || err?.message || "Login failed");
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const login = useCallback(async (email: string, password: string) => {
  setLoading(true);
  setError(null);
  try {
    console.log("Attempting login for:", email); // Debug log
    const data = await authApi.login({ email, password });
    console.log("Login response:", data); // Debug log
    
    // normalize response
    const { token: tk, user: u } = normalizeAuthResponse(data);
    console.log("Normalized token:", tk ? "Found" : "Not found"); // Debug log
    console.log("Normalized user:", u); // Debug log

    if (!tk || !u) {
      throw new Error("Invalid login response from server");
    }

    // persist
    localStorage.setItem(AUTH_TOKEN_KEY, tk);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    console.log("Tokens stored in localStorage"); // Debug log

    // Verify storage
    console.log("Verification - stored token:", localStorage.getItem(AUTH_TOKEN_KEY) ? "Found" : "Not found");

    setToken(tk);
    setUser(u);
    console.log("Login successful"); // Debug log
  } catch (err: any) {
    console.error("login error", err);
    console.error("Error response:", err?.response?.data); // Debug log
    setError(err?.response?.data?.message || err?.message || "Login failed");
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  const signup = useCallback(async (name: string | undefined, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.signup({ name, email, password });
      const { token: tk, user: u } = normalizeAuthResponse(data);

      if (!tk || !u) {
        throw new Error("Invalid signup response from server");
      }

      localStorage.setItem(AUTH_TOKEN_KEY, tk);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));

      setToken(tk);
      setUser(u);
    } catch (err: any) {
      console.error("signup error", err);
      setError(err?.response?.data?.message || err?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setToken(null);
    try {
      router.push("/login");
    } catch {
      // ignore
    }
  }, [router]);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token),
    login,
    signup,
    logout,
    refreshUser,
  };
}
