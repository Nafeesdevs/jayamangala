import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthAPI } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [ready, setReady] = useState(false);

  const persist = (u, token) => {
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const clear = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // validate saved token on first load
  useEffect(() => {
    const boot = async () => {
      if (localStorage.getItem("token")) {
        try {
          const res = await AuthAPI.profile();
          persist(res.data);
        } catch { clear(); }
      }
      setReady(true);
    };

    void boot();
    window.addEventListener("auth:logout", clear);
    return () => window.removeEventListener("auth:logout", clear);
  }, [clear]);

  const login = async (phoneno, password) => {
    const res = await AuthAPI.login({ phoneno, password });
    persist(res.user, res.token);
    return res.user;
  };

  const register = async (payload) => {
    const res = await AuthAPI.register(payload);
    persist(res.user, res.token);
    return res.user;
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch {
      /* ignore API errors on logout */
    } finally {
      clear();
      window.dispatchEvent(new Event("auth:logout"));
    }
  };

  const updateUser = (u) => persist(u);

  return (
    <AuthContext.Provider value={{ user, ready, isAdmin: user?.role === "admin", login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
