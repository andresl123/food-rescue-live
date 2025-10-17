import { useState } from "react";
import AddressForm from "./AddressForm";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupForm({ formData, onChange, onSubmit }) {
  const [step, setStep] = useState(1); // 1 = user info, 2 = address info

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
  };

  return (
    <div className="position-relative overflow-hidden">
      <AnimatePresence mode="wait">
        {/* STEP 1 — USER DETAILS */}
        {step === 1 && (
          <motion.form
            key="user-form"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleNext}
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
                onChange={onChange}
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
                onChange={onChange}
                required
              />
            </div>

            {/* Category */}
            <div className="mb-3">
              <select
                className="form-select"
                name="categoryId"
                value={formData.categoryId}
                onChange={onChange}
                required
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
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-2 fw-semibold"
              style={{ borderRadius: "15px" }}
            >
              Next →
            </button>
          </motion.form>
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
                className="btn btn-outline-dark w-25 fw-semibold"
                style={{ borderRadius: "15px" }}
                onClick={handleBack}
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={onSubmit}
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
