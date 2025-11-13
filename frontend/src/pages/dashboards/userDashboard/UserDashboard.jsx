// src/pages/dashboards/userDashboard/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import UserLayout from "../../../layout/UserLayout";
import { Navigate, useLocation } from "react-router-dom";

// role components
import DonorDashboard from "../../../components/dashboards/donor/DonorDashboard";
import ReceiverDashboard from "../../dashboards/receiver/ReceiverDashboard";
import CourierDashboard from "../../../components/dashboards/Courier/CourierDashboard";
import POD from "../../../components/POD/POD";

import { getUserProfile } from "../../../services/loginServices";

export default function UserDashboard() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // POD state
  const [showPOD, setShowPOD] = useState(false);
  const [podJobData, setPodJobData] = useState(null);
  const [podVerificationType, setPodVerificationType] = useState(null);

  const location = useLocation();

  // fetch user profile (main-branch behavior)
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

  // Show POD if we navigated here from CourierDashboard with state
  useEffect(() => {
    if (location.state?.jobData && location.state?.verificationType) {
      setPodJobData(location.state.jobData);
      setPodVerificationType(location.state.verificationType);
      setShowPOD(true);
    }
  }, [location.state]);

  // Callback to open POD from CourierDashboard
  const handleShowPOD = (jobData, verificationType) => {
    setPodJobData(jobData);
    setPodVerificationType(verificationType);
    setShowPOD(true);
  };

  // Callback to close POD
  const handleHidePOD = () => {
    setShowPOD(false);
    setPodJobData(null);
    setPodVerificationType(null);
  };

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
    // POD view (for courier flow – takes priority when active)
    if (showPOD && podJobData) {
      return (
        <POD
          jobData={podJobData}
          verificationType={podVerificationType}
          onClose={handleHidePOD}
        />
      );
    }

    // Role based dashboards (main branch behavior + courier)
    switch (role) {
      case "DONOR":
        return <DonorDashboard />;

      case "RECEIVER":
        return <ReceiverDashboard />;

      case "COURIER":
        return <CourierDashboard onShowPOD={handleShowPOD} />;

      case "ADMIN":
        return <Navigate to="/admin-dashboard" replace />;

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