// src/pages/dashboards/userDashboard/UserDashboard.jsx
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import UserLayout from "../../../layout/UserLayout";
import { useLocation } from "react-router-dom";

// role components
import DonorDashboard from "../../../components/dashboards/donor/DonorDashboard";
import CourierDashboard from "../../../components/dashboards/Courier/CourierDashboard";
import POD from "../../../components/POD/POD";

export default function UserDashboard() {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  const [showPOD, setShowPOD] = useState(false);
  const [podJobData, setPodJobData] = useState(null);
  const [podVerificationType, setPodVerificationType] = useState(null);

  let role = null;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.roles?.[0]; // Get the first role from array
    }
  } catch (err) {
    console.error("Invalid token:", err);
  }

  // Check if we should show POD from location state (when navigating from CourierDashboard)
  React.useEffect(() => {
    if (location.state?.jobData && location.state?.verificationType) {
      setPodJobData(location.state.jobData);
      setPodVerificationType(location.state.verificationType);
      setShowPOD(true);
    }
  }, [location.state]);

  // Callback function to show POD component
  const handleShowPOD = (jobData, verificationType) => {
    setPodJobData(jobData);
    setPodVerificationType(verificationType);
    setShowPOD(true);
  };

  // Callback function to hide POD and return to dashboard
  const handleHidePOD = () => {
    setShowPOD(false);
    setPodJobData(null);
    setPodVerificationType(null);
  };

  const renderByRole = () => {
    // If POD should be shown, render POD component
    if (showPOD && podJobData) {
      return (
        <POD 
          jobData={podJobData}
          verificationType={podVerificationType}
          onClose={handleHidePOD}
        />
      );
    }

    // Otherwise render role-specific dashboard
    switch (role) {
      case "DONOR":
        return <DonorDashboard />;
      case "RECEIVER":
        return <div className="text-center text-secondary mt-5">Receiver Dashboard coming soon…</div>;
      case "COURIER":
        return <CourierDashboard onShowPOD={handleShowPOD} />;
      default:
        return <div className="text-center text-danger mt-5">Invalid or missing role</div>;
    }
  };

  return <UserLayout>{renderByRole()}</UserLayout>;
}
