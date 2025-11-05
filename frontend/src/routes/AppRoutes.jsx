import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";
import CourierVerificationPage from "../pages/CourierVerificationPage";
import ProfilePage from "../pages/common/ProfilePage";
import RescueOrdersPage from "../pages/receiver/RescueOrdersPage";
import ordersData from "../mock/orders.json";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authentication" replace />} />
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/courier-verification" element={<CourierVerificationPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<RescueOrdersPage data={ordersData} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;