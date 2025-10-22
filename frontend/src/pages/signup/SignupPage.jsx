import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import toast from "react-hot-toast";

// Import all the "dumb" form components
import SignupForm from "../../components/login-signup/SignupForm";
import LoginForm from "../../components/login-signup/LoginForm";
import RequestCodeForm from "../../components/resetpassword/RequestCodeForm";
import ResetPasswordForm from "../../components/resetpassword/ResetPasswordForm";

// Import all necessary service functions
import { createUser } from "../../services/signupServices";
import { createAddress } from "../../services/addressService";
import { loginUser } from "../../services/loginServices";
import { generateResetCode, resetPassword } from "../../services/passwordResetService";

import signupImage from "../../assets/signupPage.png";
import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  // This 'view' state controls which form is visible to the user
  const [view, setView] = useState("login"); // Can be: 'login', 'signup', 'requestCode', 'resetPassword'

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State for Signup Form
  const [signupFormData, setSignupFormData] = useState({
    name: "", email: "", password: "", categoryId: "", phoneNumber: "",
    street: "", city: "", state: "", postalCode: "", country: "",
  });

  // State for Login Form
  const [loginFormData, setLoginFormData] = useState({ email: "", password: "" });

  // State for Password Reset Flow
  const [emailForReset, setEmailForReset] = useState("");
  const [resetFormData, setResetFormData] = useState({ code: "", newPassword: "", repeatPassword: "" });

  // --- EVENT HANDLERS to update state ---
  const handleSignupChange = (e) => setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value });
  const handleLoginChange = (e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  const handleResetChange = (e) => setResetFormData({ ...resetFormData, [e.target.name]: e.target.value });

  // --- SUBMISSION LOGIC ---

  const handleSignupSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Creating your account...");
    try {
      const addressPayload = {
        street: signupFormData.street, city: signupFormData.city, state: signupFormData.state,
        postalCode: signupFormData.postalCode, country: signupFormData.country,
      };
      const createdAddress = await createAddress(addressPayload);

      const userPayload = { ...signupFormData, defaultAddressId: createdAddress.id };
      const result = await createUser(userPayload);

      if (result.success) {
        toast.success("User created successfully. Please log in.");
        setView("login"); // Switch view to login after successful signup
      } else {
        throw new Error(result.error || "Signup failed");
      }
    } catch (err) {
      toast.error(`Signup failed: ${err.message}`);
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");
    const result = await loginUser(loginFormData);
    if (result.success) {
      toast.success("Login successful!");
      localStorage.setItem("accessToken", result.data.access);
      localStorage.setItem("refreshToken", result.data.refresh);
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      toast.error(result.message || "Invalid email or password.");
    }
    setIsLoading(false);
    toast.dismiss(loadingToast);
  };

  const handleRequestCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Sending code...");
    const result = await generateResetCode(emailForReset);
    if (result.success) {
      toast.success("Verification code sent!");
      setView("resetPassword"); // Switch view to the next step
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
    toast.dismiss(loadingToast);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (resetFormData.newPassword !== resetFormData.repeatPassword) {
      return toast.error("Passwords do not match.");
    }
    setIsLoading(true);
    const loadingToast = toast.loading("Resetting password...");
    const result = await resetPassword(emailForReset, resetFormData.code, resetFormData.newPassword);
    if (result.success) {
      toast.success("Password reset successfully! Please log in.");
      setView("login"); // Go back to login view on success
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
    toast.dismiss(loadingToast);
  };

  // --- DYNAMIC FORM RENDERER ---
  const renderForm = () => {
    switch (view) {
      case "signup":
        return <SignupForm formData={signupFormData} onChange={handleSignupChange} onSubmit={handleSignupSubmit} isLoading={isLoading} />;
      case "requestCode":
        return <RequestCodeForm email={emailForReset} onChange={(e) => setEmailForReset(e.target.value)} onSubmit={handleRequestCodeSubmit} isLoading={isLoading} />;
      case "resetPassword":
        return <ResetPasswordForm formData={resetFormData} onChange={handleResetChange} onSubmit={handleResetPasswordSubmit} isLoading={isLoading} />;
      case "login":
      default:
        return <LoginForm formData={loginFormData} onChange={handleLoginChange} onSubmit={handleLoginSubmit} onForgotPasswordClick={() => setView("requestCode")} isLoading={isLoading} />;
    }
  };

  return (
    <div className="container-fluid vh-100 px-5">
      <div className="row h-100 g-0">
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center p-4">
          <div className="position-relative w-100 h-100">
            <img src={signupImage} alt="Food Rescue" className="w-100 h-100 object-fit-cover" style={{ borderRadius: "30px" }} />
            <div className="position-absolute top-50 start-50 translate-middle text-center text-white px-4">
              <h1 className="fw-bold display-4">Join FoodRescue</h1>
              <p className="fs-5">Connect donors and recipients with speed and transparency.</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light form-section">
          <div className="w-100 mx-3" style={{ maxWidth: "470px" }}>
            <h2 className="text-center fw-bold mb-4" style={{ color: "#000" }}>Food Rescue Live</h2>

            {/* Tabs are now controlled by the 'view' state */}
            {(view === "login" || view === "signup") && (
              <div className="btn-group w-100 mb-3 border border-dark rounded">
                <input type="radio" className="btn-check" name="tab" id="signupTab" checked={view === "signup"} onChange={() => setView("signup")} />
                <label className="btn w-50 fw-semibold" htmlFor="signupTab" style={{ backgroundColor: view === "signup" ? "#000" : "#fff", color: view === "signup" ? "#fff" : "#000", borderRight: "1px solid #212529" }}>Sign Up</label>
                <input type="radio" className="btn-check" name="tab" id="loginTab" checked={view === "login"} onChange={() => setView("login")} />
                <label className="btn w-50 fw-semibold" htmlFor="loginTab" style={{ backgroundColor: view === "login" ? "#000" : "#fff", color: view === "login" ? "#fff" : "#000" }}>Login</label>
              </div>
            )}

            {/* Render the correct form based on the current view */}
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
}

