import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import RequestCodePage from "../pages/resetpassword/RequestCodePage";
import ResetPasswordPage from "../pages/resetpassword/ResetPasswordPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/resetpassword" element={<RequestCodePage />} />
        <Route path="/createnewpassword" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}