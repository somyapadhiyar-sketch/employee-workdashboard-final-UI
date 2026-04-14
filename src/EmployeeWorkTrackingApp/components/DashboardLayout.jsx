import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useState } from "react";
// 1. IMPORT THE NEW FIREBASE AUTH HOOK
import { useAuth } from "../hooks/AuthContext.jsx";

export default function DashboardLayout({ onLogout }) {
  const auth = useAuth();
  const user = auth.currentUser;

  // Pass down auth and onLogout to the child route (e.g. AdminDashboard, ManagerDashboard)
  // We no longer render AdminSidebar here because each dashboard is rendering its own complete layout!
  return <Outlet context={{ auth, onLogout }} />;
}
