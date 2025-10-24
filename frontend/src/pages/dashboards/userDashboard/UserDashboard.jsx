// src/pages/dashboards/userDashboard/UserDashboard.jsx
import React from "react";
import { mockSession } from "../../../mock/mockSession";
import UserLayout from "../../../layout/UserLayout";

// role components
import DonorDashboard from "../../../components/dashboards/donor/DonorDashboard";

export default function UserDashboard() {
  const role = mockSession.roles[0];

  const renderByRole = () => {
    switch (role) {
      case "DONOR":
        return <DonorDashboard />;
      case "RECEIVER":
        return <div className="text-center text-secondary mt-5">Receiver Dashboard coming soon…</div>;
      case "COURIER":
        return <div className="text-center text-secondary mt-5">Courier Dashboard coming soon…</div>;
      default:
        return <div className="text-center text-danger mt-5">Invalid role</div>;
    }
  };

  return <UserLayout>{renderByRole()}</UserLayout>;
}
