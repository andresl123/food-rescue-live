import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";
import CourierVerificationPage from "../pages/CourierVerificationPage";
import AdminDashboard from "../pages/dashboards/admin/AdminDashboard";
import UsersManagementPage from "../pages/dashboards/admin/UsersManagementPage";
import LotsManagementPage from "../pages/dashboards/admin/LotsManagementPage";
import FoodItemsManagementPage from "../pages/dashboards/admin/FoodItemsManagementPage";
import OrdersAndPODPage from "../pages/dashboards//admin/OrdersAndPODPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authentication" replace />} />
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/courier-verification" element={<CourierVerificationPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<UsersManagementPage />} />
        <Route path="/admin-lots" element={<LotsManagementPage />} />
        <Route path="/admin-food-items" element={<FoodItemsManagementPage />} />
        <Route path="/admin-orders" element={<OrdersAndPODPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;