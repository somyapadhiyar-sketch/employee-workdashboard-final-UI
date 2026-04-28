import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function AdminSidebar({
  currentSection,
  onSectionChange,
  onLogout,
  pendingCount,
  userName,
  user,
  userRole,
  leaveRequestCount,
  isSidebarOpen,
  toggleSidebar,
  onAddDepartment,
  onDeptAction,
}) {
  const { isDark, toggleTheme } = useTheme();
  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = useState(false);

  const [isFullScreenImage, setIsFullScreenImage] = useState(false);
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "A";
  const displayName = userName || "Admin";

  const menuItems = [
    {
      id: "dashboard",
      icon: "fa-home",
      label: "Dashboard",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "pending",
      icon: "fa-user-clock",
      label: "Pending",
      badge: pendingCount,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "departments",
      icon: "fa-building",
      label: "Departments",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "employees",
      icon: "fa-users",
      label: "Employees",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "attendance",
      icon: "fa-calendar-check",
      label: "Attendance",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "leave",
      icon: "fa-calendar-minus",
      label: "Leave",
      badge: leaveRequestCount,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "holidays",
      icon: "fa-umbrella-beach",
      label: "Public Holidays",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "org_overview",
      icon: "fa-chess-king",
      label: "Productivity Analysis",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "activityMonitor",
      icon: "fa-desktop",
      label: "Activity Monitor",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "profile",
      icon: "fa-user-circle",
      label: "My Profile",
      color: "from-blue-500 to-blue-600",
    },
  ];

  const navigate = useNavigate();

  const handleMenuClick = (item) => {
    if (item.id === "departments") {
      setIsDepartmentsExpanded(!isDepartmentsExpanded);
      if (onDeptAction) onDeptAction("view");
    } else {
      setIsDepartmentsExpanded(false);
    }
    onSectionChange(item.id);
    if (window.innerWidth < 1024 && item.id !== "departments") {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.div
        className="fixed top-4 left-4 z-50 p-2 lg:hidden cursor-pointer"
      >
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className={`p-3 rounded-xl shadow-lg ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
        >
          <i
            className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`}
          ></i>
        </motion.button>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{
          x: isSidebarOpen ? 0 : -300,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        className={`fixed left-0 top-0 h-full w-full lg:w-[280px] p-5 flex flex-col z-40 overflow-y-auto custom-scrollbar border-r ${isDark
          ? "bg-[#0f172a]/95 backdrop-blur-xl border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
          : "bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.04)]"
          }`}
      >
        {/* Profile Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 pt-6 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => user?.profileImage && setIsFullScreenImage(true)}
            className={`w-24 h-24 ${user?.profileImage ? '' : 'bg-gradient-to-tr from-blue-600 to-cyan-400'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_8px_16px_rgb(0,0,0,0.15)] border-[3px] border-white/50 cursor-pointer overflow-hidden relative z-10 group`}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <span className="text-4xl font-extrabold text-white drop-shadow-md">
                {userInitial}
              </span>
            )}
          </motion.div>
          <h2
            className={`font-extrabold text-xl tracking-tight relative z-10 ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            {displayName}
          </h2>
          <p className="text-blue-500 text-xs font-bold tracking-widest uppercase mt-1 relative z-10">Administrator</p>
        </motion.div>

        {/* Theme Toggle */}
        <motion.button
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`mx-auto mb-4 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all ${isDark
            ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
            : "bg-cyan-100 text-gray-700 hover:bg-cyan-200"
            }`}
        >
          <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
          <span className="hidden sm:inline">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </motion.button>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1 relative z-10"
        >
          {menuItems.map((item, index) => (
            <div key={item.id} className="w-full relative flex flex-col">
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.04 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuClick(item)}
                className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center justify-between group rounded-xl ${(currentSection === item.id || (item.id === "departments" && currentSection === "add_department"))
                  ? `bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20`
                  : isDark
                    ? `hover:bg-white/10 text-gray-400 hover:text-white`
                    : `hover:bg-gray-100/80 text-gray-600 hover:text-gray-900`
                  }`}
              >
                <span className="flex items-center gap-3.5">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    (currentSection === item.id || (item.id === "departments" && currentSection === "add_department"))
                      ? "bg-white/20 text-white"
                      : isDark
                        ? "bg-gray-800 text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10"
                        : "bg-white text-gray-500 shadow-sm group-hover:text-blue-600 group-hover:bg-blue-50"
                  }`}>
                    <i className={`fas ${item.icon} text-[15px]`}></i>
                  </div>
                  <span className="font-semibold text-[15px]">{item.label}</span>
                </span>
                {item.badge > 0 && item.id !== "profile" && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold shadow-sm"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {item.id === "departments" && isDepartmentsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`overflow-hidden rounded-b-xl shadow-lg ${isDark ? "bg-gray-800 shadow-xl" : "bg-white shadow-sm"}`}
                  >
                    <div className="flex flex-col py-1 pb-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (onAddDepartment) onAddDepartment(); }}
                        className={`w-full text-left px-5 py-2.5 transition-all flex items-center gap-3 font-bold ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-50"}`}
                      >
                        <i className="fas fa-plus w-5 flex justify-center text-sm"></i> Add New Department
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (onDeptAction) onDeptAction("edit"); }}
                        className={`w-full text-left px-5 py-2.5 transition-all flex items-center gap-3 font-bold ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-50"}`}
                      >
                        <i className="fas fa-pencil-alt w-5 flex justify-center text-sm"></i> Update Department
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (onDeptAction) onDeptAction("delete"); }}
                        className={`w-full text-left px-5 py-2.5 transition-all flex items-center gap-3 font-bold ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-50"}`}
                      >
                        <i className="fas fa-trash-alt w-5 flex justify-center text-sm"></i> Delete Department
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className={`w-full text-left px-4 py-3 sm:py-3.5 rounded-xl transition-all text-gray-700 group mt-4 ${isDark
            ? "bg-gray-800 hover:bg-red-900/50 text-gray-200 hover:text-red-400"
            : "bg-white hover:bg-red-50 text-gray-700 hover:text-red-600"
            }`}
        >
          <span className="flex items-center gap-3 font-bold">
            <i className="fas fa-sign-out-alt w-5 text-lg group-hover:translate-x-1 transition-transform"></i>
            Logout
          </span>
        </motion.button>
      </motion.div>

      {/* Profile Modal */}

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {isFullScreenImage && user?.profileImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm"
          >
            <button
              onClick={() => setIsFullScreenImage(false)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[110] w-12 h-12 bg-white/10 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={user.profileImage}
              alt="Profile Full Screen"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
