import { createContext, useContext, useState, useEffect } from "react";
import { ADMIN_CREDENTIALS } from "../constants/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const DATA_VERSION = 'v2_clean';
    
    // Check if we need to clear session (if version changed)
    if (localStorage.getItem('dataVersion') !== DATA_VERSION) {
      sessionStorage.removeItem("currentUser");
    }

    const storedUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    
    setLoading(false);
  }, []);

  // Set current user (called after login)
  const login = (userData) => {
    setCurrentUser(userData);
    sessionStorage.setItem("currentUser", JSON.stringify(userData));
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  // Update user locally + in sessionStorage
  const updateUser = (updatedData) => {
    if (!currentUser) return;
    const newUser = { ...currentUser, ...updatedData };
    setCurrentUser(newUser);
    sessionStorage.setItem("currentUser", JSON.stringify(newUser));

    // Also update in employees list (which stays in localStorage as it's shared data)
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const userId = newUser.uid || newUser.id;
    const updatedEmployees = employees.map((emp) =>
      (emp.uid || emp.id) === userId ? { ...emp, ...updatedData } : emp
    );
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
