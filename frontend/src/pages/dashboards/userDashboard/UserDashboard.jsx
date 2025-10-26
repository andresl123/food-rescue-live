// src/pages/dashboards/userDashboard/UserDashboard.jsx
import React from "react";
import { jwtDecode } from "jwt-decode";
import UserLayout from "../../../layout/UserLayout";

// role components
import DonorDashboard from "../../../components/dashboards/donor/DonorDashboard";

export default function UserDashboard() {
  const token = localStorage.getItem("accessToken");

  let role = null;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.roles?.[0]; // Get the first role from array
    }
  } catch (err) {
    console.error("Invalid token:", err);
  }

  const renderByRole = () => {
    switch (role) {
      case "DONOR":
        return <DonorDashboard />;
      case "RECEIVER":
        return <div className="text-center text-secondary mt-5">Receiver Dashboard coming soon…</div>;
      case "COURIER":
        return <div className="text-center text-secondary mt-5">Courier Dashboard coming soon…</div>;
      default:
        return <div className="text-center text-danger mt-5">Invalid or missing role</div>;
    }
  };

  return <UserLayout>{renderByRole()}</UserLayout>;
}
