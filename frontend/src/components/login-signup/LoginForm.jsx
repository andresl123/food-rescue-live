import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { loginUser } from "../../services/loginServices";

export default function LoginForm({ onForgotPasswordClick }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- toast-based validation (no browser tooltip) ---
    if (!formData.email.trim()) {
      return toast.error("Email is required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return toast.error("Please enter a valid email address.");
    }
    if (!formData.password) {
      return toast.error("Password is required.");
    }

    const loadingToast = toast.loading("Logging in...");
    setIsLoading(true);

    try {
      const result = await loginUser(formData);
      console.log("Login result:", result);

      if (result.success) {
        toast.success("Login successful!");
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        toast.error(result.message || "Invalid email or password.");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleGoogleLogin = () => {
    toast("Redirecting to Google…");
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  return (
    <div className="position-relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key="login-form"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Disable native validation tooltips */}
          <form noValidate onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* Forgot Password */}
            <div className="text-end mb-4">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small"
                style={{ color: "#000" }}
                onClick={onForgotPasswordClick}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-dark w-100 py-2 fw-semibold mb-3"
              style={{ borderRadius: "15px" }}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* OR */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">OR</span>
              <hr className="flex-grow-1" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              className="btn btn-light w-100 py-2 border fw-semibold d-flex align-items-center justify-content-center gap-2"
              style={{
                borderRadius: "15px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
              }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              Continue with Google
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
