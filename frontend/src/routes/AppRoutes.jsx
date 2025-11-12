import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";
import ProfilePage from "../pages/common/ProfilePage";
import RescueOrdersPage from "../pages/receiver/RescueOrdersPage";
import ordersData from "../mock/orders.json";
import FoodItemList from "../components/dashboards/donor/FoodItemList";
import TestLotImport from "../pages/common/TestLotImport";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authentication" replace />} />
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<RescueOrdersPage data={ordersData} />} />
        <Route path="/bulk-import" element={<TestLotImport />} />
        <Route path="/food-items" element={<FoodItemList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;