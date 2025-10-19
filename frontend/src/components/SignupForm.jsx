import { useState, useMemo } from "react";
import AddressForm from "./AddressForm";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function SignupForm({ formData, onChange, onSubmit }) {
  const [step, setStep] = useState(1); // 1 = user info, 2 = address info

  // -------------------- PASSWORD STRENGTH --------------------
  const evaluatePasswordStrength = useMemo(() => {
    const password = formData.password || "";
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["#dc3545", "#ffc107", "#0d6efd", "#198754"];
    return {
      score,
      label: labels[score - 1] || "",
      color: colors[score - 1] || "#dee2e6",
    };
  }, [formData.password]);

  // -------------------- VALIDATIONS --------------------
  const validateUserInfo = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Please enter a password");
      return false;
    }
    if (evaluatePasswordStrength.score < 3) {
      toast.error("Password is too weak — try mixing numbers, uppercase, and special characters");
      return false;
    }

    if (!formData.categoryId) {
      toast.error("Please select your category");
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Phone number must contain only digits (10–15 digits)");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    const isValid = validateUserInfo();
    if (isValid) {
      setStep(2);
    }
  };

  const handleBack = () => setStep(1);

  const handleAddressSubmit = () => {
    const requiredFields = ["street", "city", "state", "postalCode", "country"];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        toast.error("Please fill all address fields");
        return;
      }
    }
    onSubmit();
  };

  // -------------------- UI --------------------
  return (
    <div className="position-relative overflow-hidden">
      <AnimatePresence mode="wait">
        {/* STEP 1 — USER DETAILS */}
        {step === 1 && (
          <motion.div
            key="user-form"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Full Name */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
              />
            </div>

            {/* Animated Strength Bar */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: 1,
                  width: `${(evaluatePasswordStrength.score / 4) * 100}%`,
                  backgroundColor: evaluatePasswordStrength.color,
                }}
                transition={{ duration: 0.4 }}
                className="rounded-2"
                style={{
                  height: "6px",
                  marginBottom: "6px",
                }}
              />
            )}
            {formData.password && (
              <p
                className="small fw-semibold"
                style={{
                  color: evaluatePasswordStrength.color,
                  marginBottom: "10px",
                }}
              >
                Strength: {evaluatePasswordStrength.label}
              </p>
            )}

            {/* Category */}
            <div className="mb-3">
              <select
                className="form-select"
                name="categoryId"
                value={formData.categoryId}
                onChange={onChange}
              >
                <option value="">Select Category</option>
                <option value="DONOR">Donor</option>
                <option value="RECEIVER">Receiver</option>
                <option value="COURIER">Courier</option>
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
                onChange={onChange}
              />
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-dark w-100 py-2 fw-semibold"
              style={{ borderRadius: "15px" }}
            >
              Next →
            </button>
          </motion.div>
        )}

        {/* STEP 2 — ADDRESS DETAILS */}
        {step === 2 && (
          <motion.div
            key="address-form"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AddressForm formData={formData} onChange={onChange} />

            <div className="d-flex justify-content-between mt-3">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-outline-dark w-25 fw-semibold"
                style={{ borderRadius: "15px" }}
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleAddressSubmit}
                className="btn btn-dark w-50 fw-semibold"
                style={{ borderRadius: "15px" }}
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
