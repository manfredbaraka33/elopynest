import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const navigate = useNavigate();

  const login = (newToken, user,newRefreshToken) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("refresh", newRefreshToken);
    localStorage.setItem("username", user);
    setToken(newToken);
    setUsername(user);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    setToken(null);
    // setUsername(null);
    navigate("/login");
  };

  // ✅ Correct use of navigate inside useEffect
  useEffect(() => {
    if (!token && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
