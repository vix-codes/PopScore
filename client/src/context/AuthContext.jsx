import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, signupUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("popscore_token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("popscore_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("popscore_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("popscore_token");
        localStorage.removeItem("popscore_user");
        setToken("");
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, [token]);

  async function handleLogin(payload) {
    const data = await loginUser(payload);
    localStorage.setItem("popscore_token", data.token);
    localStorage.setItem("popscore_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function handleSignup(payload) {
    const data = await signupUser(payload);
    localStorage.setItem("popscore_token", data.token);
    localStorage.setItem("popscore_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("popscore_token");
    localStorage.removeItem("popscore_user");
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        login: handleLogin,
        signup: handleSignup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
