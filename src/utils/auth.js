/**
 * Authentication Utilities
 * Consolidates auth-related functions used across multiple pages
 */

/**
 * Handle user logout - clears session and redirects to login
 * @param {function} navigate - React Router navigate function
 */
export const handleLogout = (navigate) => {
  localStorage.clear();
  navigate("/login");
};

/**
 * Get stored user from localStorage
 * @returns {Object} Parsed user object or null
 */
export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Failed to parse stored user:", err);
    return null;
  }
};

/**
 * Get stored token from localStorage
 * @returns {string} Token string or null
 */
export const getStoredToken = () => {
  return localStorage.getItem("token");
};

/**
 * Clear all stored session data
 */
export const clearSession = () => {
  localStorage.clear();
};
