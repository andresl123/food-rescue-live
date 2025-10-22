import React, { useMemo, useState } from "react";
import { Button, Form, Spinner, ProgressBar } from "react-bootstrap";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import { generateResetCode, resetPassword } from "../../services/passwordResetService";

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

export default function ResetPasswordForm({ onBack }) {
  const [step, setStep] = useState("email"); // "email" | "verify"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // strength: 0..4
  const strength = useMemo(() => {
    const pwd = newPassword || "";
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }, [newPassword]);

  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong"][strength] || "Very weak";
  const strengthPct = [5, 25, 50, 75, 100][strength] || 5;
  const strengthVariant = ["danger", "danger", "warning", "success", "success"][strength] || "danger";

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter an email address.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Please enter a valid email address.");

    setIsLoading(true);
    const loadingToast = toast.loading("Sending code...");
    try {
      const result = await generateResetCode(email);
      if (result?.success) {
        toast.success("Verification code sent!");
        setEmailLocked(true);
        setStep("verify");
      } else {
        toast.error(result?.message || "Could not send code.");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Please enter the 6-digit code.");
    if (!newPassword) return toast.error("Please enter your new password.");
    if (newPassword !== repeatPassword) return toast.error("Passwords do not match.");

    setIsLoading(true);
    const loadingToast = toast.loading("Resetting password...");
    try {
      const result = await resetPassword(email, code, newPassword);
      if (result?.success) {
        toast.success("Password reset successfully! Please log in.");
        if (onBack) onBack();
      } else {
        toast.error(result?.message || "Failed to reset password.");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Reset Password</h4>
        <Button variant="link" className="text-decoration-none text-dark p-0" onClick={onBack}>
          ← Back
        </Button>
      </div>

      {/* Email step */}
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div key="email-step" {...fadeSlide}>
            <Form onSubmit={handleSendCode}>
              <Form.Group className="mb-3" controlId="resetEmail">
                <Form.Control
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: 15, padding: 10 }}
                  disabled={emailLocked || isLoading}
                />
              </Form.Group>

              <Button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-semibold"
                style={{ borderRadius: 15 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                    Sending...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify (OTP + Passwords) */}
      <AnimatePresence mode="wait">
        {step === "verify" && (
          <motion.div key="verify-step" {...fadeSlide}>
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3" controlId="resetEmailLocked">
                <Form.Control
                  type="email"
                  value={email}
                  disabled
                  style={{ borderRadius: 15, padding: 10, background: "#f2f2f2", color: "#555" }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="resetCode">
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code from email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ borderRadius: 15, padding: 10 }}
                  required
                />
              </Form.Group>

              {/* New password with inline Show/Hide */}
              <Form.Group className="mb-2" controlId="resetNewPassword">
                <div className="position-relative">
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      borderRadius: 15,
                      padding: "10px 70px 10px 10px", // right padding to make room for the toggle
                    }}
                    required
                  />
                  {/* inline toggle inside the input (no border) */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowPasswords((s) => !s)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowPasswords((s) => !s)}
                    className="position-absolute top-50 translate-middle-y"
                    style={{
                      right: 12,
                      userSelect: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 12,
                      color: "#6c757d",
                      background: "transparent",
                    }}
                  >
                    {showPasswords ? "Hide" : "Show"}
                  </span>
                </div>

                {/* Strength meter: thin bar + centered label below */}
                <div className="mt-2">
                  <ProgressBar
                    now={strengthPct}
                    variant={strengthVariant}
                    style={{ height: 6, borderRadius: 6 }}
                  />
                </div>
                <div className="text-center mt-1" style={{ fontSize: 13, color: "#6c757d" }}>
                  Strength: {strengthLabel}
                </div>
                <small className="text-muted">
                  Use at least 8 characters with a mix of upper-case, numbers, and symbols.
                </small>
              </Form.Group>

              <Form.Group className="mb-3" controlId="resetRepeatPassword">
                <Form.Control
                  type={showPasswords ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  style={{ borderRadius: 15, padding: 10 }}
                  required
                  isInvalid={repeatPassword.length > 0 && repeatPassword !== newPassword}
                />
                <Form.Control.Feedback type="invalid">
                  Passwords do not match.
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="btn btn-dark w-100 py-2 fw-semibold"
                style={{ borderRadius: 15 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                    Resetting...
                  </>
                ) : (
                  "Set New Password"
                )}
              </Button>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
