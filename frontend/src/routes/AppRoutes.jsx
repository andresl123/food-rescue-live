import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../pages/signup/SignupPage";
import HelloWorld from "../pages/testing/helloworld";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/authentication" element={<SignupPage />} />
        <Route path="/HelloWorld" element={<HelloWorld />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;