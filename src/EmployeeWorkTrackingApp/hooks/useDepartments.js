import { useState } from 'react';
import { DEPARTMENTS as initialDepts } from '../constants/config';

// localStorage key for custom (dynamically added) departments
const STORAGE_KEY = 'customDepartments';

function getStoredCustomDepts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export const useDepartments = () => {
  const [customDepts, setCustomDepts] = useState(getStoredCustomDepts);

  // Merge default config departments with any custom ones saved in localStorage
  const departmentsMap = { ...initialDepts, ...customDepts };

  const departmentsList = Object.entries(departmentsMap).map(([id, data]) => ({ id, ...data }));

  const addDepartment = async (id, departmentData) => {
    try {
      const updated = { ...customDepts, [id]: departmentData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setCustomDepts(updated);
      return { success: true };
    } catch (error) {
      console.error('Error adding new department:', error);
      return { success: false, error };
    }
  };

  const editDepartment = async (id, updatedData) => {
    try {
      // For built-in departments we still store the override in customDepts
      const updated = { ...customDepts, [id]: { ...(customDepts[id] || {}), ...updatedData } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setCustomDepts(updated);
      return { success: true };
    } catch (error) {
      console.error('Error editing department:', error);
      return { success: false, error };
    }
  };

  const deleteDepartment = async (id) => {
    try {
      const updated = { ...customDepts };
      delete updated[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setCustomDepts(updated);
      return { success: true };
    } catch (error) {
      console.error('Error deleting department:', error);
      return { success: false, error };
    }
  };

  return {
    departmentsMap,
    departmentsList,
    loading: false, // no async fetch needed
    addDepartment,
    editDepartment,
    deleteDepartment,
  };
};
