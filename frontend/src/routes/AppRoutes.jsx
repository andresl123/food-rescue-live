import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage"; // Assuming you have this

// --- 1. IMPORT YOUR NEW PAGES ---
import RequestCodePage from "../pages/resetpassword/RequestCodePage";
import ResetPasswordPage from "../pages/resetpassword/ResetPasswordPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/resetpassword" element={<RequestCodePage />} />
        <Route path="/createnewpassword" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}