import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import UserDashboard from "../pages/dashboards/userDashboard/UserDashboard";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;