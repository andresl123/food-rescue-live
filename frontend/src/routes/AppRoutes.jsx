import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Your Page Imports ---
import SignupPage from "../pages/signup/SignupPage";
import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";
import CourierVerificationPage from "../pages/CourierVerificationPage";
import ProfilePage from "../pages/common/ProfilePage";
import RescueOrdersPage from "../pages/receiver/RescueOrdersPage";
import FoodItemList from "../components/dashboards/donor/FoodItemList";
import TestLotImport from "../pages/common/TestLotImport";

// --- Admin Page Imports ---
import AdminLayout from "../components/dashboards/admin/AdminLayout";
import AdminDashboard from "../pages/dashboards/admin/AdminDashboard";
import UsersManagementPage from "../pages/dashboards/admin/UsersManagementPage";
import LotsManagementPage from "../pages/dashboards/admin/LotsManagementPage";
import FoodItemsManagementPage from "../pages/dashboards/admin/FoodItemsManagementPage";
import OrdersAndPODPage from "../pages/dashboards/admin/OrdersAndPODPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public & User-Specific Routes --- */}
        {/* These routes do NOT have the admin layout */}
        <Route path="/" element={<Navigate to="/authentication" replace />} />
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/courier-verification" element={<CourierVerificationPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<RescueOrdersPage />} />
        <Route path="/bulk-import" element={<TestLotImport />} />
        <Route path="/food-items" element={<FoodItemList />} />

        {/* --- Admin Routes --- */}
        {/* All routes inside here will share the new AdminLayout
            (which includes the top Navbar and the Sidebar) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-users" element={<UsersManagementPage />} />
          <Route path="/admin-lots" element={<LotsManagementPage />} />
          <Route path="/admin-food-items" element={<FoodItemsManagementPage />} />
          <Route path="/admin-orders" element={<OrdersAndPODPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;