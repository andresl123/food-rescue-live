import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authentication" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;