import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { loginUser } from "../services/loginServices";
// import googleIcon from "../assets/google-icon.png"; // Add a Google icon image in assets folder
import { loginUser } from "../services/loginServices";


export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    const result = await loginUser(formData);

    if (result.success) {
      setResponseData(result.data);
      setMessage("Login successful!");
      // Optionally store token
      // Store tokens
        localStorage.setItem("accessToken", result.data.access);
        localStorage.setItem("refreshToken", result.data.refresh);

        setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setMessage("Invalid email or password.");
    }
  };

  // Google OAuth handler
  const handleGoogleLogin = () => {
    // Replace with your backend Google OAuth endpoint
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Email */}
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

      {/* Password */}
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

      {/* Forgot Password */}
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

      {/* Login Button */}
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
{/*         <img */}
{/*           src={googleIcon} */}
{/*           alt="Google" */}
{/*           style={{ width: "20px", height: "20px" }} */}
{/*         /> */}
        Continue with Google
      </button>

      {/* Message */}
      {message && (
        <p className="text-center mt-3 text-secondary small">{message}</p>
      )}
    </form>
  );
}
