import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Home.jsx jaisa fix - Vite wala + Render fallback
const API_URL = import.meta.env.VITE_API_URL || "https://vehicle-rental-backend-n8fa.onrender.com/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    const tokenInfo = localStorage.getItem('token');

    if (userInfo && userInfo !== "undefined") {
      try {
        const parsed = JSON.parse(userInfo);
        setUser(parsed.user || parsed);
      } catch {}
    }
    if (tokenInfo) {
      setToken(tokenInfo);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/users/login`, { email, password });

    const actualUser = data.user || data;
    const actualToken = data.token || actualUser.token;

    console.log("LOGIN RESPONSE:", data);
    console.log("USER ROLE:", actualUser.role);

    setUser(actualUser);
    setToken(actualToken);
    localStorage.setItem('user', JSON.stringify(actualUser));
    localStorage.setItem('token', actualToken);
    return data;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await axios.post(`${API_URL}/users/register`, { name, email, phone, password });
    const actualUser = data.user || data;
    const actualToken = data.token || actualUser.token;

    setUser(actualUser);
    setToken(actualToken);
    localStorage.setItem('user', JSON.stringify(actualUser));
    localStorage.setItem('token', actualToken);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);