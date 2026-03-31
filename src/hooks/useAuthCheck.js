/**
 * Centralized Auth Check Hook
 * Consolidates authentication validation logic used in 3+ pages
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthCheck = (pageTitle = "AutoAuth") => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // Validate token and user exist
    if (!storedUser || storedUser === "undefined" || !storedToken) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    try {
      // Decode JWT and check expiration
      const payloadBase64 = storedToken.split(".")[1];
      if (payloadBase64) {
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          localStorage.clear();
          navigate("/login");
          return;
        }
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      localStorage.clear();
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      document.title = pageTitle;
    } catch (err) {
      console.error("Failed to parse user session data:", err);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate, pageTitle]);

  return user;
};
