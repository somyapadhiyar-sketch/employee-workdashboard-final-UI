import { useState } from "react";
import { motion } from "framer-motion";
import { useDepartments } from "../hooks/useDepartments";

export default function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const { departmentsMap, loading: loadingDepts } = useDepartments();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "employee",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && value !== "" && !/^\d*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (role) => setFormData({ ...formData, role });
  const handleDepartmentChange = (e) =>
    setFormData({ ...formData, department: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { firstName, lastName, email, phone, department, role, password } = formData;

    if (!firstName || !lastName || !email || !phone || !department || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const pending = JSON.parse(localStorage.getItem("pendingRegistrations")) || [];

    // Check if email already registered
    if (employees.find((emp) => emp.email === email)) {
      setError("Email already registered!");
      setLoading(false);
      return;
    }
    if (pending.find((emp) => emp.email === email)) {
      setError("Registration already pending approval!");
      setLoading(false);
      return;
    }

    // One manager per department rule
    if (role === "dept_manager" || role === "manager") {
      const existingManager = employees.find(
        (emp) =>
          emp.department === department &&
          (emp.role === "dept_manager" || emp.role === "manager") &&
          emp.status === "approved"
      );
      if (existingManager) {
        setError(
          "A manager already exists for this department! Only one manager per department is allowed."
        );
        setLoading(false);
        return;
      }
      const pendingManager = pending.find(
        (emp) =>
          emp.department === department &&
          (emp.role === "dept_manager" || emp.role === "manager")
      );
      if (pendingManager) {
        setError("A manager registration is already pending for this department!");
        setLoading(false);
        return;
      }
    }

    const newUser = {
      ...formData,
      id: Date.now(),
      uid: `local_${Date.now()}`,
      createdAt: new Date().toISOString(),
      clockedIn: false,
      clockInTime: null,
      lastClockInDate: null,
      lastClockOutDate: null,
      activeLogId: null,
      status: "pending",
    };

    const updatedPending = [...pending, newUser];
    localStorage.setItem("pendingRegistrations", JSON.stringify(updatedPending));

    setLoading(false);
    if (onRegisterSuccess) {
      onRegisterSuccess();
    } else {
      onSwitchToLogin();
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row w-full font-sans bg-gray-50">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-5/12 lg:w-1/2 bg-mesh flex flex-col justify-center items-center p-8 min-h-[35vh] md:min-h-screen order-1 relative overflow-hidden shadow-2xl z-10"
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
          <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            <i className="fas fa-user-plus text-5xl text-white drop-shadow-md"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
            Join Us<span className="text-cyan-300">.</span>
          </h1>
          <p className="text-white/90 text-lg font-light mb-6">Create your account and start tracking your work</p>

          <div className="mt-6 glass-dark rounded-2xl p-5 text-left max-w-xs mx-auto border border-white/10 shadow-xl">
            <p className="text-white font-semibold text-sm mb-3 flex items-center">
              <i className="fas fa-info-circle mr-2 text-cyan-300"></i> How it works:
            </p>
            <ol className="text-white/80 text-sm space-y-2 pl-2">
              <li className="flex items-start"><span className="text-cyan-400 mr-2 font-bold">1.</span> Register with your details</li>
              <li className="flex items-start"><span className="text-cyan-400 mr-2 font-bold">2.</span> Admin reviews your request</li>
              <li className="flex items-start"><span className="text-cyan-400 mr-2 font-bold">3.</span> Once approved, you can log in</li>
            </ol>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Register Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-10 bg-white overflow-y-auto min-h-[65vh] md:min-h-screen order-2 relative custom-scrollbar"
      >
        <div className="w-full max-w-md relative z-10 py-8">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Account</h2>
            <p className="text-gray-500 font-medium">Fill in your details to register</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-red-50/80 backdrop-blur border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-5 shadow-sm flex items-center font-medium text-sm"
            >
              <i className="fas fa-exclamation-circle text-base mr-3 text-red-500"></i>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                    placeholder="First Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Last Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <i className="fas fa-envelope"></i>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <i className="fas fa-phone"></i>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                  placeholder="10 digits"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Department</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 z-10">
                  <i className="fas fa-building"></i>
                </div>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  disabled={loadingDepts}
                  required
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm appearance-none relative"
                >
                  <option value="" disabled>
                    {loadingDepts ? "Loading departments..." : "Select Department"}
                  </option>
                  {Object.entries(departmentsMap).map(([key, dept]) => (
                    <option key={key} value={key}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                {[
                  { value: "employee", label: "Employee", icon: "fa-user" },
                  { value: "dept_manager", label: "Manager", icon: "fa-user-tie" },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleChange(option.value)}
                    className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      formData.role === option.value
                        ? "bg-white shadow-sm border border-gray-200 text-blue-600 font-semibold"
                        : "text-gray-500 hover:text-gray-700 font-medium"
                    }`}
                  >
                    <i className={`fas ${option.icon} ${formData.role === option.value ? 'text-lg' : 'text-base'} transition-all`}></i>
                    <span className="text-xs">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <i className="fas fa-lock"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-800 shadow-sm"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2 shadow-sm">
              <i className="fas fa-info-circle text-blue-500 mt-0.5 text-sm"></i>
              <p className="text-blue-800 text-xs font-medium leading-relaxed">
                Your account requires admin approval before you can login.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-70 text-[15px] relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch fa-spin mr-3 text-lg"></i>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Create Account <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center pb-4">
            <p className="text-gray-500 font-medium text-sm">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 font-bold hover:text-indigo-600 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-blue-600 hover:after:scale-x-100 after:transition-transform after:origin-bottom-right hover:after:origin-bottom-left"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
        
        {/* Subtle background decoration right side */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -ml-20 -mt-20"></div>
      </motion.div>
    </div>
  );
}
