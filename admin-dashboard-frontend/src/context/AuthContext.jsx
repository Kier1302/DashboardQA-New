// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshContainersTrigger, setRefreshContainersTrigger] = useState(0);

  const triggerRefreshContainers = () => {
    console.log("AuthContext: triggerRefreshContainers called");
    setRefreshContainersTrigger(prev => {
      const newValue = prev + 1;
      console.log("AuthContext: refreshContainersTrigger updated to", newValue);
      return newValue;
    });
  };

  useEffect(() => {
    // Fetch user details if logged in (for example, using token from localStorage or cookies)
    const token = localStorage.getItem("token");
    if (token) {
      // Simulate getting user details from API
      fetch("https://dashboardqa-new.onrender.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("AuthContext fetch /api/users/me response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("AuthContext fetched user data:", data);
        if (!data.email) {
          console.warn("AuthContext warning: user data missing email property");
        }
        setUser(data);
        console.log("AuthContext user state set:", data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("AuthContext fetch error:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    // Clear user state and token from localStorage
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, handleLogout, triggerRefreshContainers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
