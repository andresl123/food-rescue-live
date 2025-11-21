import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "../services/RequireAuth";

// --- Your Page Imports ---
import SignupPage from "../pages/signup/SignupPage";
import CompleteSignupPage from "../pages/signup/CompleteSignupPage";
import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";
import CourierVerificationPage from "../pages/CourierVerificationPage";
import ProfilePage from "../pages/common/ProfilePage";
import RescueOrdersPage from "../pages/receiver/RescueOrdersPage";
import FoodItemList from "../components/dashboards/donor/FoodItemList";
import TestLotImport from "../pages/common/TestLotImport";
import CurrentRescueOrdersPage from "../pages/receiver/CurrentRescueOrdersPage";
import CompletedDeliveries from "../components/dashboards/Courier/CompletedDeliveries";

// --- Admin Page Imports ---
import AdminLayout from "../components/dashboards/admin/AdminLayout";
import AdminDashboard from "../pages/dashboards/admin/AdminDashboard";
import UsersManagementPage from "../pages/dashboards/admin/UsersManagementPage";
import LotsManagementPage from "../pages/dashboards/admin/LotsManagementPage";
import FoodItemsManagementPage from "../pages/dashboards/admin/FoodItemsManagementPage";
import OrdersAndPODPage from "../pages/dashboards/admin/OrdersAndPODPage";

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppRoutes() {
  return (
      <GoogleOAuthProvider clientId={clientId}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/authentication" replace />} />
            <Route path="/authentication" element={<SignupPage />} />
            <Route path="/complete-signup" element={<CompleteSignupPage />} />

            {/* any logged-in user */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* DONOR-only */}
            <Route element={<RequireAuth allowed={["DONOR"]} />}>
              <Route path="/food-items" element={<FoodItemList />} />
              <Route path="/bulk-import" element={<TestLotImport />} />
            </Route>

            {/* RECEIVER-only */}
            <Route element={<RequireAuth allowed={["RECEIVER"]} />}>
              <Route path="/orders" element={<RescueOrdersPage />} />
              <Route path="/current-orders" element={<CurrentRescueOrdersPage />} />
            </Route>

            {/* COURIER- only */}
            <Route element={<RequireAuth allowed={["COURIER"]} />}>
              <Route path="/Completed-Deliveries" element={<CompletedDeliveries />} />
            </Route>

            {/* ADMIN-only */}
            <Route element={<RequireAuth allowed={["ADMIN"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-users" element={<UsersManagementPage />} />
                <Route path="/admin-lots" element={<LotsManagementPage />} />
                <Route path="/admin-food-items" element={<FoodItemsManagementPage />} />
                <Route path="/admin-orders" element={<OrdersAndPODPage />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
     </GoogleOAuthProvider>
  );
}

export default AppRoutes;