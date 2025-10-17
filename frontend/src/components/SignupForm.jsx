import { useState } from "react";
import { createUser } from "../services/signupServices";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    categoryId: "",
    phoneNumber: "",
    defaultAddressId: "",
  });

  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");
    const result = await createUser(formData);
    if (result.success) {
      setResponseData(result.data);
      setMessage("Signup successful.");
    } else {
      setMessage("Signup failed or backend not reachable.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Full Name */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

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
      <div className="mb-3">
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

      {/* Category */}
      <div className="mb-3">
        <select
          className="form-select"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Donor">Donor</option>
          <option value="Receiver">Receiver</option>
          <option value="Courier">Courier</option>
        </select>
      </div>

      {/* Phone */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>

      {/* Address */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="defaultAddressId"
          placeholder="Default Address ID"
          value={formData.defaultAddressId}
          onChange={handleChange}
          required
        />
      </div>

      {/* Password Strength Checker */}
      <div className="mt-2 small mb-4">
        {(() => {
          const password = formData.password;
          const rules = [
            { label: "At least 8 characters", valid: password.length >= 8 },
            { label: "Contains a number", valid: /\d/.test(password) },
            {
              label: "Contains a special character",
              valid: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
            },
          ];

          const score = rules.filter((r) => r.valid).length;
          const label =
            score === 0
              ? "Weak"
              : score === 1
              ? "Fair"
              : score === 2
              ? "Good"
              : "Strong";

          return (
            <div>
              <p className="mb-1" style={{ color: "#000" }}>
                Password Strength: {label}
              </p>

              {/* Strength Bar */}
              <div
                style={{
                  height: "6px",
                  backgroundColor: "#e5e5e5",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(score / 3) * 100}%`,
                    backgroundColor: "#000",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Rule Checklist */}
              {rules.map((rule, i) => (
                <div key={i} className="d-flex align-items-center">
                  <span
                    style={{
                      color: rule.valid ? "#000" : "#ccc",
                      fontWeight: "bold",
                      marginRight: "6px",
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ color: rule.valid ? "#000" : "#888" }}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <button
        type="submit"
        className="btn btn-dark w-100 py-2 fw-semibold"
        style={{ borderRadius: "15px" }}
      >
        Sign Up
      </button>

      {message && (
        <p className="text-center mt-3 text-secondary small">{message}</p>
      )}
    </form>
  );
}
