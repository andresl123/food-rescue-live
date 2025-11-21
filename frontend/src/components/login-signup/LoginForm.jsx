import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { loginUser } from "../../services/loginServices";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginForm({ onForgotPasswordClick }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      console.log("login component used");
      const result = await loginUser(formData);
      console.log("Login result:", result);

      if (result.success) {
        toast.success("Login successful!");
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

  // Real Google handler – gets credential (ID token) from GoogleLogin component
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        toast.error("Google did not return a credential.");
        return;
      }

      const resp = await axios.post(
        "http://localhost:8090/api/google/login",
        { credential },
        { withCredentials: true }
      );

      const { success, data, message } = resp.data;

      if (!success) {
        toast.error(message || "Google login failed");
        return;
      }

      if (data.newUser) {
        // first-time Google user → go to complete-signup
        navigate("/complete-signup", {
          state: {
            userId: data.userId,
            email: data.email,
            name: data.name,
          },
        });
      } else {
        // existing user → tokens set by BFF
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Google sign-in failed");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in failed");
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
            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="continue_with" // label text
                shape="pill"
                theme="outline"
                width="260"
              />
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
