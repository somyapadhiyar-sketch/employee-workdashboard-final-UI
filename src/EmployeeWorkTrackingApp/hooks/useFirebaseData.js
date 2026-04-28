import { useState, useEffect, useCallback } from 'react';
import departmentManagers from '../Data.json';

/**
 * Central data hook — uses localStorage instead of Firestore.
 * Drop-in replacement for the Firebase version, same API surface.
 */
export default function useFirebaseData(currentUser) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [analyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Bootstrap from localStorage ───────────────────────────────────────────
  useEffect(() => {
    // Version stamp — bump this any time you want a fresh slate.
    const DATA_VERSION = 'v2_clean';
    const storedVersion = localStorage.getItem('dataVersion');
    if (storedVersion !== DATA_VERSION) {
      // Wipe all old data so the app starts fresh
      localStorage.removeItem('employees');
      localStorage.removeItem('pendingRegistrations');
      localStorage.removeItem('workLogs');
      localStorage.removeItem('leaveRequests');
      localStorage.removeItem('attendance');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('customDepartments');
      localStorage.setItem('dataVersion', DATA_VERSION);
    }

    const storedEmployees = JSON.parse(localStorage.getItem('employees')) || [];
    const storedPending   = JSON.parse(localStorage.getItem('pendingRegistrations')) || [];
    const storedLogs      = JSON.parse(localStorage.getItem('workLogs')) || [];
    const storedLeave     = JSON.parse(localStorage.getItem('leaveRequests')) || [];

    // Seed default managers from Data.json if missing
    const existingIds = storedEmployees.map((e) => e.id);
    const newManagers = departmentManagers.filter((m) => !existingIds.includes(m.id));
    const combined = [...newManagers, ...storedEmployees];
    if (newManagers.length > 0) {
      localStorage.setItem('employees', JSON.stringify(combined));
    }

    // Merge approved employees + pending into allUsers
    const pendingWithStatus = storedPending.map((u) => ({ ...u, status: 'pending' }));
    setAllUsers([...combined, ...pendingWithStatus]);
    setWorkLogs(storedLogs);
    setLeaveRequests(storedLeave);
    setIsLoading(false);
  }, []);

  // ── Helpers to persist ────────────────────────────────────────────────────
  const persistEmployees = (employees) => {
    const approved = employees.filter((u) => u.status !== 'pending');
    localStorage.setItem('employees', JSON.stringify(approved));
  };

  const persistPending = (pending) => {
    localStorage.setItem('pendingRegistrations', JSON.stringify(pending));
  };

  const persistLogs = (logs) => {
    localStorage.setItem('workLogs', JSON.stringify(logs));
    setWorkLogs(logs);
  };

  const persistLeave = (leave) => {
    localStorage.setItem('leaveRequests', JSON.stringify(leave));
    setLeaveRequests(leave);
  };

  // ── Derived helpers ───────────────────────────────────────────────────────
  const approvedEmployees     = allUsers.filter((u) => u.status === 'approved' && u.role !== 'admin');
  const pendingRegistrations  = allUsers.filter((u) => u.status === 'pending');
  const approvedManagers      = approvedEmployees.filter((u) => u.role === 'dept_manager' || u.role === 'manager');
  const regularEmployees      = approvedEmployees.filter((u) => u.role !== 'dept_manager' && u.role !== 'manager');

  // ── Approve / Reject ──────────────────────────────────────────────────────
  const approveEmployee = async (userId) => {
    try {
      const updated = allUsers.map((u) =>
        (u.uid || u.id) === userId ? { ...u, status: 'approved', approvedAt: new Date().toISOString() } : u
      );
      setAllUsers(updated);
      persistEmployees(updated);
      const pending = updated.filter((u) => u.status === 'pending');
      persistPending(pending);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const rejectEmployee = async (userId) => {
    try {
      const updated = allUsers.filter((u) => (u.uid || u.id) !== userId);
      setAllUsers(updated);
      persistEmployees(updated);
      const pending = updated.filter((u) => u.status === 'pending');
      persistPending(pending);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ── Delete employee ───────────────────────────────────────────────────────
  const deleteEmployee = async (userId, requestingUser) => {
    const employee = allUsers.find((u) => (u.uid || u.id) === userId);
    if (!employee) return { success: false, message: 'Employee not found!' };

    if (requestingUser?.role === 'dept_manager' || requestingUser?.role === 'manager') {
      if (employee.role === 'admin') return { success: false, message: 'Cannot delete admin!' };
      if (employee.role === 'dept_manager' || employee.role === 'manager')
        return { success: false, message: 'Cannot delete other managers!' };
      if (employee.department !== requestingUser.department)
        return { success: false, message: 'You can only delete employees in your department!' };
    }

    try {
      const updated = allUsers.filter((u) => (u.uid || u.id) !== userId);
      setAllUsers(updated);
      persistEmployees(updated);

      // Clean work logs
      const updatedLogs = workLogs.filter((l) => l.employeeId !== userId);
      persistLogs(updatedLogs);

      return {
        success: true,
        message: `${employee.firstName} ${employee.lastName} removed successfully!`,
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ── Work logs ─────────────────────────────────────────────────────────────
  const addWorkLog = async (workEntry) => {
    try {
      const newLog = { ...workEntry, id: Date.now().toString(), createdAt: new Date().toISOString() };
      const updatedLogs = [...workLogs, newLog];
      persistLogs(updatedLogs);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateWorkLog = async (logId, updates) => {
    try {
      const updatedLogs = workLogs.map((l) =>
        l.id === logId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      );
      persistLogs(updatedLogs);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteWorkLog = async (logId) => {
    try {
      const updatedLogs = workLogs.filter((l) => l.id !== logId);
      persistLogs(updatedLogs);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ── Attendance helpers ────────────────────────────────────────────────────
  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = workLogs.filter((l) => l.date === today);
    const result = {};
    todayLogs.forEach((l) => {
      result[l.employeeId] = { status: 'present', clockInTime: l.clockInTime };
    });
    return result;
  };

  const updateAttendance = async (employeeId, status) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog = {
      id: Date.now().toString(),
      employeeId,
      date: today,
      status,
      clockInTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updatedLogs = [...workLogs, newLog];
    persistLogs(updatedLogs);
    return { success: true };
  };

  // ── Clock in / out ────────────────────────────────────────────────────────
  const clockIn = async (userId) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const logId = `log_${Date.now()}`;
    try {
      const newLog = {
        id: logId,
        employeeId: userId,
        date: today,
        clockInTime: now.toISOString(),
        clockOutTime: null,
        status: 'present',
        totalHours: null,
        createdAt: now.toISOString(),
      };
      const updatedLogs = [...workLogs, newLog];
      persistLogs(updatedLogs);

      // Update user clockedIn flag
      const employees = JSON.parse(localStorage.getItem('employees')) || [];
      const updatedEmps = employees.map((e) =>
        (e.uid || e.id) === userId
          ? { ...e, clockedIn: true, lastClockInDate: today, activeLogId: logId }
          : e
      );
      localStorage.setItem('employees', JSON.stringify(updatedEmps));

      // Also update currentUser in localStorage
      const cu = JSON.parse(localStorage.getItem('currentUser'));
      if (cu && (cu.uid || cu.id) === userId) {
        const updatedCu = { ...cu, clockedIn: true, lastClockInDate: today, activeLogId: logId };
        localStorage.setItem('currentUser', JSON.stringify(updatedCu));
      }

      return { success: true, logId };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const clockOut = async (userId, logId) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    try {
      const updatedLogs = workLogs.map((l) => {
        if (l.id === logId) {
          const clockInTime = new Date(l.clockInTime);
          const totalMs = now - clockInTime;
          const totalHours = +(totalMs / (1000 * 60 * 60)).toFixed(2);
          return { ...l, clockOutTime: now.toISOString(), totalHours };
        }
        return l;
      });
      persistLogs(updatedLogs);

      // Update user clockedIn flag
      const employees = JSON.parse(localStorage.getItem('employees')) || [];
      const updatedEmps = employees.map((e) =>
        (e.uid || e.id) === userId
          ? { ...e, clockedIn: false, lastClockOutDate: today, activeLogId: null }
          : e
      );
      localStorage.setItem('employees', JSON.stringify(updatedEmps));

      const cu = JSON.parse(localStorage.getItem('currentUser'));
      if (cu && (cu.uid || cu.id) === userId) {
        const updatedCu = { ...cu, clockedIn: false, lastClockOutDate: today, activeLogId: null };
        localStorage.setItem('currentUser', JSON.stringify(updatedCu));
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ── Leave requests ────────────────────────────────────────────────────────
  const submitLeaveRequest = async (leaveData) => {
    try {
      const newReq = {
        ...leaveData,
        id: Date.now().toString(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      const updated = [...leaveRequests, newReq];
      persistLeave(updated);
      return { success: true, message: 'Leave request submitted successfully!' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const approveLeaveRequest = async (requestId) => {
    try {
      const updated = leaveRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved', respondedAt: new Date().toISOString() } : r
      );
      persistLeave(updated);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const rejectLeaveRequest = async (requestId) => {
    try {
      const updated = leaveRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected', respondedAt: new Date().toISOString() } : r
      );
      persistLeave(updated);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ── Getter helpers ────────────────────────────────────────────────────────
  const getApprovedEmployees      = () => approvedEmployees;
  const getApprovedManagers       = () => approvedManagers;
  const getEmployeesByDepartment  = (dept) => approvedEmployees.filter((u) => u.department === dept);
  const getPendingForDepartment   = (dept) => pendingRegistrations.filter((u) => u.department === dept);
  const getPendingManagers        = () => pendingRegistrations.filter((u) => u.role === 'dept_manager' || u.role === 'manager');
  const getAllLeaveRequests        = () => leaveRequests;
  const getPendingLeaveRequests   = () => leaveRequests.filter((r) => r.status === 'pending');
  const getLeaveRequestsForDepartment = (dept) => leaveRequests.filter((r) => r.department === dept);
  const getPendingLeaveForDepartment  = (dept) => leaveRequests.filter((r) => r.department === dept && r.status === 'pending');
  const getLeaveRequestsByEmployee    = (employeeId) => leaveRequests.filter((r) => r.employeeId === employeeId);
  const getEmployeesOnLeave = () => {
    const today = new Date().toISOString().split('T')[0];
    return leaveRequests.filter(
      (r) => r.status === 'approved' && r.startDate <= today && r.endDate >= today
    );
  };
  const getEmployeeWorkLogs = (employeeId) => workLogs.filter((l) => l.employeeId === employeeId);

  // Update user profile
  const updateUser = async (updatedUser) => {
    try {
      const userId = updatedUser.uid || updatedUser.id;
      const updated = allUsers.map((u) =>
        (u.uid || u.id) === userId ? { ...u, ...updatedUser } : u
      );
      setAllUsers(updated);
      persistEmployees(updated);

      const cu = JSON.parse(localStorage.getItem('currentUser'));
      if (cu && (cu.uid || cu.id) === userId) {
        localStorage.setItem('currentUser', JSON.stringify({ ...cu, ...updatedUser }));
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return {
    // State
    allUsers,
    workLogs,
    leaveRequests,
    analyticsData,
    isLoading,
    // Derived
    approvedEmployees,
    pendingRegistrations,
    approvedManagers,
    regularEmployees,
    // Actions
    approveEmployee,
    rejectEmployee,
    deleteEmployee,
    updateUser,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    clockIn,
    clockOut,
    updateAttendance,
    getTodayAttendance,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    // Getters
    getApprovedEmployees,
    getApprovedManagers,
    getEmployeesByDepartment,
    getPendingForDepartment,
    getPendingManagers,
    getAllLeaveRequests,
    getPendingLeaveRequests,
    getLeaveRequestsForDepartment,
    getPendingLeaveForDepartment,
    getLeaveRequestsByEmployee,
    getEmployeesOnLeave,
    getEmployeeWorkLogs,
  };
}
