import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../services/loginServices";

export default function LoginForm() {
  const navigate = useNavigate();

  // Manage form input state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Display feedback message and store response
  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  // Update form fields
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission and login process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    const result = await loginUser(formData);

    if (result.success) {
      setResponseData(result.data);
      setMessage("Login successful!");

      // Store tokens locally
      localStorage.setItem("accessToken", result.data.access);
      localStorage.setItem("refreshToken", result.data.refresh);

      // Redirect to dashboard after a short delay
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setMessage("Invalid email or password.");
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  // Navigate to forgot password page
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // -------------------- UI with Animation --------------------
  return (
    <div className="position-relative overflow-hidden">
      //--Adding Animation
      <AnimatePresence mode="wait">
        <motion.div
          key="login-form"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-2">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-end mb-4">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small"
                style={{ color: "#000" }}
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-dark w-100 py-2 fw-semibold mb-3"
              style={{ borderRadius: "15px" }}
            >
              Login
            </button>

            {/* OR Separator */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">OR</span>
              <hr className="flex-grow-1" />
            </div>

            {/* Google OAuth Login */}
            <button
              type="button"
              className="btn btn-light w-100 py-2 border fw-semibold d-flex align-items-center justify-content-center gap-2"
              style={{
                borderRadius: "15px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
              }}
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </button>

            {/* Status Message */}
            {message && (
              <p className="text-center mt-3 text-secondary small">{message}</p>
            )}
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
