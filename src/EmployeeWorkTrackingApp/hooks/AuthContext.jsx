import { createContext, useContext, useState, useEffect } from "react";
import { ADMIN_CREDENTIALS } from "../constants/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    // Only restore session if data version matches (prevents stale logins)
    const DATA_VERSION = 'v2_clean';
    if (localStorage.getItem('dataVersion') === DATA_VERSION) {
      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    }
    setLoading(false);
  }, []);

  // Set current user (called after login)
  const login = (userData) => {
    setCurrentUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  // Update user locally + in localStorage
  const updateUser = (updatedData) => {
    if (!currentUser) return;
    const newUser = { ...currentUser, ...updatedData };
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    // Also update in employees list
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
