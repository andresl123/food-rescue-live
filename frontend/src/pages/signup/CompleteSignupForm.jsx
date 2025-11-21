import { useMemo, useState } from "react";
import AddressForm from "../../components/login-signup/AddressForm";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const cardVariants = {
  initial: { x: 60, opacity: 0, scale: 0.98 },
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: { x: -60, opacity: 0, scale: 0.98 },
};

const roleOptions = [
  {
    id: "RECEIVER",
    label: "Receiver",
    description: "Request and receive surplus food from donors.",
  },
  {
    id: "DONOR",
    label: "Donor",
    description: "List surplus food and help reduce food waste.",
  },
  {
    id: "COURIER",
    label: "Courier",
    description: "Pickup and deliver food between donors & receivers.",
  },
];

export default function CompleteSignupForm({
  provisionalUser,
  formData,
  onChange,
  onSubmit,
}) {
  const [step, setStep] = useState(1); // 1 = role, 2 = rest of details

  const evaluatePasswordStrength = useMemo(() => {
    const password = formData.password || "";
    let score = 0;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const lengthOK = password.length >= 8;
    const minLength = password.length >= 6;

    if (!minLength) {
      score = 1;
    } else {
      if (lengthOK) score++;
      if (hasLower) score++;
      if (hasUpper) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;
    }
    score = Math.min(score, 5);

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["#dc3545", "#fd7e14", "#ffc107", "#0d6efd", "#198754"];

    return {
      score,
      label: labels[score - 1] || "",
      color: colors[score - 1] || "#dee2e6",
    };
  }, [formData.password]);

  // ---------- validation helpers ----------

  const validateRoleSelected = () => {
    if (!formData.categoryId) {
      toast.error("Please choose a role to continue");
      return false;
    }
    return true;
  };

  const validateDetails = () => {
    if (!formData.password?.trim()) {
      toast.error("Please enter a password");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (evaluatePasswordStrength.score < 3) {
      toast.error(
        "Password is too weak — try mixing numbers, uppercase, and special characters"
      );
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formData.phoneNumber?.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Phone number must contain only digits (10–15 digits)");
      return false;
    }

    const required = ["street", "city", "state", "postalCode", "country"];
    for (const f of required) {
      if (!formData[f]?.trim()) {
        toast.error("Please fill all address fields");
        return false;
      }
    }

    return true;
  };

  const handleRoleClick = (roleId) => {
    onChange({ target: { name: "categoryId", value: roleId } });
  };

  const handleNextFromRole = () => {
    if (validateRoleSelected()) setStep(2);
  };

  const handleAddressSubmit = () => {
    if (!validateDetails()) return;
    onSubmit();
  };

  const selectedRole = formData.categoryId;

  return (
    <div className="position-relative overflow-hidden">
      {/* header inside card */}
      <div className="mb-3 text-center">
        <div className="fw-semibold">
          {provisionalUser?.name || "User"}{" "}
          <span className="text-muted fw-normal small">logged in as</span>
        </div>
        <div className="text-muted small">{provisionalUser?.email}</div>
      </div>

      {/* tiny step indicator */}
      <div className="d-flex justify-content-center mb-3 gap-2">
        <div
          className={`rounded-pill`}
          style={{
            width: 10,
            height: 10,
            backgroundColor: step === 1 ? "#000" : "#dee2e6",
          }}
        />
        <div
          className={`rounded-pill`}
          style={{
            width: 10,
            height: 10,
            backgroundColor: step === 2 ? "#000" : "#dee2e6",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-role"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="card border-0 shadow-sm rounded-4 p-4"
          >
            <h5 className="mb-3 text-center fw-semibold">
              Choose how you want to use Food Rescue Live
            </h5>

            <div className="d-grid gap-3">
              {roleOptions.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => handleRoleClick(role.id)}
                    className="btn text-start p-3 w-100"
                    style={{
                      borderRadius: "18px",
                      border: active ? "2px solid #000" : "1px solid #dee2e6",
                      backgroundColor: active ? "#000" : "#fff",
                      color: active ? "#fff" : "#212529",
                      boxShadow: active ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
                      transition:
                        "all 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: active ? "#fff" : "#f2f2f2",
                          color: active ? "#000" : "#333",
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        {role.label.charAt(0)}
                      </div>
                     <div>
                       <div
                         className="fw-semibold mb-1"
                         style={{ color: active ? "#ffffff" : "#212529" }}
                       >
                         {role.label}
                       </div>
                       <div
                         className="small"
                         style={{ color: active ? "#f8f9fa" : "#6c757d" }}
                       >
                         {role.description}
                       </div>
                     </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNextFromRole}
              className="btn btn-dark w-100 py-2 fw-semibold mt-4"
              style={{ borderRadius: "16px" }}
            >
              Continue →
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-details"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="card border-0 shadow-sm rounded-4 p-4"
          >
            <h5 className="mb-3 fw-semibold text-center">
              Secure your account & add address
            </h5>

            {/* Password */}
            <div className="mb-2">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Set a password"
                value={formData.password}
                onChange={onChange}
              />
            </div>

            {formData.password && (
              <>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: 1,
                    width: `${(evaluatePasswordStrength.score / 5) * 100}%`,
                    backgroundColor: evaluatePasswordStrength.color,
                  }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2"
                  style={{ height: "6px", marginBottom: "6px" }}
                />
                <p
                  className="small fw-semibold"
                  style={{
                    color: evaluatePasswordStrength.color,
                    marginBottom: "10px",
                  }}
                >
                  Strength: {evaluatePasswordStrength.label}
                </p>
              </>
            )}

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

            {/* Address card portion */}
            <div className="mb-2">
              <AddressForm formData={formData} onChange={onChange} />
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline-dark w-25 fw-semibold"
                style={{ borderRadius: "16px" }}
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleAddressSubmit}
                className="btn btn-dark w-50 fw-semibold"
                style={{ borderRadius: "16px" }}
              >
                Complete Signup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
