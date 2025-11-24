import React, { createContext, useContext, useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL;

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkLoginStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        credentials: 'include', 
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user status", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};