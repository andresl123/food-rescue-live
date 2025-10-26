import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import CourierVerificationPage from "../pages/CourierVerificationPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/authentication" replace />} />
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/courier-verification" element={<CourierVerificationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;