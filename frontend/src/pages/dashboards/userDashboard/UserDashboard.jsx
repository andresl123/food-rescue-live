// src/pages/dashboards/userDashboard/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import UserLayout from "../../../layout/UserLayout";

// role components
import DonorDashboard from "../../../components/dashboards/donor/DonorDashboard";
import ReceiverDashboard from "../../dashboards/receiver/ReceiverDashboard";
import { getUserProfile } from "../../../services/loginServices";

export default function UserDashboard() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchUserData = async () => {
        const result = await getUserProfile();

        if (result.success && result.data) {
          console.log("✅ User profile:", result.data);
          setRole(result.data.role || result.data.roles?.[0] || null);
          setEmail(result.data.email || null);
        } else {
          console.error("❌ Failed to fetch profile:", result.message);
        }

        setLoading(false);
      };

      fetchUserData();
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

  const renderByRole = () => {
    switch (role) {
      case "DONOR":
        return <DonorDashboard />;
      case "RECEIVER":
        return <ReceiverDashboard />;
      case "COURIER":
        return (
          <div className="text-center text-secondary mt-5">
            Courier Dashboard coming soon…
          </div>
        );
      default:
        return (
          <div className="text-center text-danger mt-5">
            Invalid or missing role
          </div>
        );
    }
  };

  return <UserLayout role={role}>{renderByRole()}</UserLayout>;
}
