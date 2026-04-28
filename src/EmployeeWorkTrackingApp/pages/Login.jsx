import { useState } from "react";
import { motion } from "framer-motion";
import { ADMIN_CREDENTIALS } from "../constants/config";
import departmentManagers from "../Data.json";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getEmployees = () => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
    const existingIds = storedEmployees.map((e) => e.id);
    const seedManagers = departmentManagers.filter((m) => !existingIds.includes(m.id));
    return [...seedManagers, ...storedEmployees];
  };

  const getPending = () =>
    JSON.parse(localStorage.getItem("pendingRegistrations")) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const employees = getEmployees();
    const pending = getPending();

    // ── Admin login ──────────────────────────────────────────────────────────
    if (role === "admin") {
      const admin = ADMIN_CREDENTIALS.find(
        (a) => a.email === email && a.password === password
      );
      if (admin) {
        const userData = {
          id: `admin_${admin.email}`,
          uid: `admin_${admin.email}`,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: "admin",
          department: null,
          status: "approved",
          clockedIn: false,
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setLoading(false);
        onLoginSuccess(userData);
        return;
      }
      setError("Invalid admin credentials.");
      setLoading(false);
      return;
    }

    // ── Manager login ────────────────────────────────────────────────────────
    if (role === "dept_manager" || role === "manager") {
      const user = employees.find(
        (emp) =>
          emp.email === email &&
          emp.password === password &&
          (emp.role === "dept_manager" || emp.role === "manager") &&
          emp.status === "approved"
      );

      if (!user) {
        const pendingMgr = pending.find(
          (emp) =>
            emp.email === email &&
            emp.password === password &&
            (emp.role === "dept_manager" || emp.role === "manager")
        );
        if (pendingMgr) {
          setError(
            "Your manager account is pending approval. Please wait for admin approval."
          );
          setLoading(false);
          return;
        }
        setError("Invalid credentials or account not approved yet.");
        setLoading(false);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      setLoading(false);
      onLoginSuccess(user);
      return;
    }

    // ── Employee login ───────────────────────────────────────────────────────
    const user = employees.find(
      (emp) =>
        emp.email === email &&
        emp.password === password &&
        emp.role === role &&
        emp.status === "approved"
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      setLoading(false);
      onLoginSuccess(user);
      return;
    }

    // Check if in pending
    const pendingUser = pending.find(
      (emp) => emp.email === email && emp.password === password
    );
    if (pendingUser) {
      setError("Your account is pending admin approval. Please wait for approval.");
    } else {
      setError("Invalid credentials or account not approved yet.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden md:h-screen md:overflow-hidden flex flex-col md:flex-row w-full font-sans bg-gray-50">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-5/12 lg:w-1/2 bg-auth-mesh flex flex-col justify-center items-center p-8 min-h-[35vh] md:min-h-screen order-1 relative overflow-hidden shadow-2xl z-10"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Glass overlay pattern */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center relative z-20 max-w-md"
        >
          <div className="w-28 h-28 glass rounded-3xl flex items-center justify-center mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            <i className="fas fa-layer-group text-6xl text-white drop-shadow-md"></i>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            WorkTracker<span className="text-cyan-300">.</span>
          </h1>
          <p className="text-white/90 text-xl font-light mb-8">Elevate your team's productivity</p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8 justify-center">
            {["Real-time Tracking", "Leave Management", "Analytics", "Multi-role"].map(
              (f) => (
                <span
                  key={f}
                  className="bg-white/10 backdrop-blur border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full"
                >
                  {f}
                </span>
              )
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white min-h-[65vh] md:h-screen md:overflow-y-auto custom-scrollbar order-2 relative"
      >
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Please sign in to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-red-50/80 backdrop-blur border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-6 shadow-sm flex items-center font-medium"
            >
              <i className="fas fa-exclamation-circle text-lg mr-3 text-red-500"></i>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                    placeholder="name@company.com"
                    id="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                    placeholder="Enter your password"
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                {[
                  { value: "employee", label: "Employee", icon: "fa-user" },
                  { value: "dept_manager", label: "Manager", icon: "fa-user-tie" },
                  { value: "admin", label: "Admin", icon: "fa-user-shield" },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(option.value)}
                    className={`py-2.5 px-1 rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      role === option.value
                        ? "bg-white shadow-sm border border-gray-200 text-blue-600 font-semibold"
                        : "text-gray-500 hover:text-gray-700 font-medium"
                    }`}
                  >
                    <i className={`fas ${option.icon} ${role === option.value ? 'text-lg' : 'text-base'} transition-all`}></i>
                    <span className="text-xs">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-70 text-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch fa-spin mr-3 text-xl"></i>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign In <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium">
              New to WorkTracker?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 font-bold hover:text-indigo-600 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-600 hover:after:scale-x-100 after:transition-transform after:origin-bottom-right hover:after:origin-bottom-left"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
        
        {/* Subtle background decoration right side */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mb-20"></div>
      </motion.div>
    </div>
  );
}
