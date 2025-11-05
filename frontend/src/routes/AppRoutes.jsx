import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import CourierVerificationPage from "../pages/CourierVerificationPage";

import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authentication" replace />} />
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/courier-verification" element={<CourierVerificationPage />} />
        {/* <Route path="/jobs" element={<JobsPage />} /> */}
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;