import { createContext, useContext, useState, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = "https://localhost:7146/api";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("padel_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    // Surface the server's error message if available
    const msg =
      (typeof data === "object" && (data?.message || data?.title || JSON.stringify(data))) ||
      data ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Rehydrate from localStorage on mount
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("padel_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── SIGN UP ──────────────────────────────────────────────────────────────
  // Expects your .NET endpoint: POST /api/auth/register
  // Body: { fullName, email, password }
  // Response: { token, user: { id, fullName, email, elo, ... } }
  const register = useCallback(async ({ fullName, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });

      const token = data.token || data.accessToken;
      const userData = data.user || { fullName, email };

      localStorage.setItem("padel_token", token);
      localStorage.setItem("padel_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── SIGN IN ──────────────────────────────────────────────────────────────
  // Expects your .NET endpoint: POST /api/auth/login
  // Body: { email, password }
  // Response: { token, user: { id, fullName, email, elo, ... } }
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token = data.token || data.accessToken;
      const userData = data.user || { email };

      localStorage.setItem("padel_token", token);
      localStorage.setItem("padel_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("padel_token");
    localStorage.removeItem("padel_user");
    setUser(null);
    setError(null);
  }, []);

  // ── CLEAR ERROR ──────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}