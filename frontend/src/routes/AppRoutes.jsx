import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import DonorDashboard from "../pages/dashboard/DonorDashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/dashboard" element={<DonorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;