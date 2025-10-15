import { BrowserRouter, Routes, Route } from "react-router-dom";

// 1. Import the password reset components
import RequestCodeForm from '../components/resetpassword/RequestCodeForm';
import ResetPasswordForm from '../components/resetpassword/ResetPasswordForm';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This path shows the form to request a verification code */}
        <Route path="/resetpassword" element={<RequestCodeForm />} />

        {/* This path shows the form to enter the code and new password */}
        <Route path="/createnewpassword" element={<ResetPasswordForm />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;