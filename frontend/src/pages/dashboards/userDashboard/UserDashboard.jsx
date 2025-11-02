// src/pages/dashboards/userDashboard/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import UserLayout from "../../../layout/UserLayout";
import DonorDashboard from "../../../components/dashboards/donor/DonorDashboard";

export default function UserDashboard() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.roles?.[0] || null;
        console.log("✅ Decoded token role:", userRole);
        setRole(userRole);
      } catch (err) {
        console.error("❌ Invalid token:", err);
      }
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-secondary">
        <div className="spinner-border text-dark" role="status" />
        <span className="ms-3">Loading dashboard...</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center mt-5 text-danger">
        Invalid or missing role — please log in again.
      </div>
    );
  }

  return (
    <UserLayout role={role}>
      {role === "DONOR" && <DonorDashboard />}
      {role === "RECEIVER" && (
        <div className="text-center text-secondary mt-5">
          Receiver Dashboard coming soon…
        </div>
      )}
      {role === "COURIER" && (
        <div className="text-center text-secondary mt-5">
          Courier Dashboard coming soon…
        </div>
      )}
    </UserLayout>
  );
}
