// src/components/VerifyAndUpdateModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateResetCode, validateEmailCode, updateUserEmail, updateUserPhone } from "../../services/passwordResetService";
import { getUserProfile, logoutUser } from "../../services/loginServices";
import { useNavigate } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18 },
};

// ---- Replace these with your real API calls ----
async function apiSendOtp({ userId, channel, target }) {
  // Call your backend: POST /otp/send { userId, channel: 'email' | 'mobile', target }
  await new Promise(r => setTimeout(r, 650));
  return { ok: true, message: 'OTP sent' };
}
async function apiVerifyOtp({ userId, channel, target, otp }) {
  // Call your backend: POST /otp/verify { userId, channel, target, otp }
  await new Promise(r => setTimeout(r, 650));
  // Simulate pass if otp is 123456
  return { ok: otp === '123456', message: otp === '123456' ? 'Verified' : 'Invalid OTP' };
}
async function apiSaveChange({ userId, channel, newValue }) {
  // Call your backend: PATCH /users/:id/contact { email | mobile }
  await new Promise(r => setTimeout(r, 650));
  return { ok: true, message: 'Saved' };
}
// ------------------------------------------------

function isEmail(str = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
function isPhone(str = '') {
  return /^[0-9+()\-\s]{7,20}$/.test(str);
}

export default function VerifyAndUpdateModal({
  show,
  onClose,
  type = 'email',           // 'email' | 'mobile'
  value = '',
  userId,
  title = 'Update Contact',
}) {

  const navigate = useNavigate();


  const backdropRef = useRef(null);
  const [newTarget, setNewTarget] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const channelLabel = useMemo(() => (type === 'mobile' ? 'Mobile' : 'Email'), [type]);

  useEffect(() => {
    if (show) {
      // Reset modal fields
      setNewTarget("");
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setMsg(null);
      setLoading(false);

      // Fetch user profile to get userId
      getUserProfile().then((res) => {
        if (res.success) {
          setCurrentUserId(res.data.userId || res.data.id);
          console.log("Fetched userId:", res.data.userId);
        } else {
          console.error("Failed to load user profile:", res.message);
          setMsg({ type: "danger", text: "Unable to fetch user information." });
        }
      });
    }
  }, [show]);

  // Close on ESC
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  // Click outside to close
  const onBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose?.();
  };

  const validNewTarget =
    type === 'email' ? isEmail(newTarget) : isPhone(newTarget);

//   const handleSendOtp = async () => {
//     if (!validNewTarget) {
//       setMsg({ type: 'danger', text: `Please enter a valid ${channelLabel.toLowerCase()}.` });
//       return;
//     }
//     setLoading(true);
//     setMsg(null);
//     const res = await apiSendOtp({ userId, channel: type, target: newTarget.trim() });
//     setLoading(false);
//     if (res.ok) {
//       setOtpSent(true);
//       setMsg({ type: 'success', text: 'OTP sent. Check your inbox/messages.' });
//     } else {
//       setMsg({ type: 'danger', text: res.message || 'Failed to send OTP.' });
//     }
//   };

    const handleSendOtp = async () => {
      if (!validNewTarget) {
        setMsg({ type: "danger", text: `Please enter a valid ${channelLabel.toLowerCase()}.` });
        return;
      }

      setLoading(true);
      setMsg(null);

      let targetIdentifier = "";

      try {
        if (type === "email") {
          // ✅ For updating email: send OTP to *new* email
          targetIdentifier = newTarget.trim();
        } else if (type === "mobile") {
          // ✅ For updating phone: send OTP to *existing user email*
          const profile = await getUserProfile();
          if (!profile.success) {
            setMsg({ type: "danger", text: "Unable to load your registered email." });
            setLoading(false);
            return;
          }
          targetIdentifier = profile.data.email;
        }

        // ✅ Send OTP using the backend Courier service
        const res = await generateResetCode(targetIdentifier, 'UPDATE_PHONE_EMAIL');

        setLoading(false);

        if (res.success) {
          setOtpSent(true);
          if (type === "email") {
            setMsg({ type: "success", text: "OTP sent to your new email address. Please check your inbox." });
          } else {
            setMsg({ type: "success", text: "OTP sent to your registered email for phone verification." });
          }
        } else {
          setMsg({ type: "danger", text: res.message });
        }
      } catch (error) {
        console.error("OTP Send Error:", error);
        setMsg({ type: "danger", text: "Something went wrong. Please try again." });
        setLoading(false);
      }
    };



//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length < 4) {
//       setMsg({ type: 'danger', text: 'Enter the OTP you received.' });
//       return;
//     }
//     setLoading(true);
//     setMsg(null);
//     const res = await apiVerifyOtp({
//       userId,
//       channel: type,
//       target: newTarget.trim(),
//       otp: otp.trim(),
//     });
//     setLoading(false);
//     if (res.ok) {
//       setOtpVerified(true);
//       setMsg({ type: 'success', text: 'OTP verified. You can now save changes.' });
//     } else {
//       setMsg({ type: 'danger', text: res.message || 'Invalid OTP.' });
//     }
//   };

    const handleVerifyOtp = async () => {
      if (!otp || otp.length < 4) {
        setMsg({ type: "danger", text: "Enter the OTP you received." });
        return;
      }

      setLoading(true);
      setMsg(null);

      try {
        let identifier = "";

        if (type === "email") {
          // For email update, verify OTP sent to new email
          identifier = newTarget.trim();
        } else if (type === "mobile") {
          // For phone update, verify OTP sent to registered email
          const profile = await getUserProfile();
          if (!profile.success) {
            setMsg({ type: "danger", text: "Unable to load your registered email." });
            setLoading(false);
            return;
          }
          identifier = profile.data.email;
        }

        const res = await validateEmailCode(identifier, otp);
        setLoading(false);

        if (res.success) {
          setOtpVerified(true);
          setMsg({ type: "success", text: "OTP verified. You can now save changes." });
        } else {
          setMsg({ type: "danger", text: res.message || "Invalid OTP." });
        }
      } catch (err) {
        console.error("OTP Verify Error:", err);
        setLoading(false);
        setMsg({ type: "danger", text: "Something went wrong while verifying." });
      }
    };



//   const handleSave = async () => {
//     if (!validNewTarget) {
//       setMsg({ type: 'danger', text: `Please enter a valid ${channelLabel.toLowerCase()}.` });
//       return;
//     }
//     setLoading(true);
//     setMsg(null);
//     const res = await apiSaveChange({
//       userId,
//       channel: type,
//       newValue: newTarget.trim(),
//     });
//     setLoading(false);
//     if (res.ok) {
//       setMsg({ type: 'success', text: `${channelLabel} updated.` });
//       // Optionally close after a short delay
//       setTimeout(() => onClose?.(), 700);
//     } else {
//       setMsg({ type: 'danger', text: res.message || 'Failed to save.' });
//     }
//   };

    const handleSave = async () => {
      if (!validNewTarget) {
        setMsg({ type: "danger", text: `Please enter a valid ${channelLabel.toLowerCase()}.` });
        return;
      }

      setLoading(true);
      setMsg(null);

      try {
        let res;
        if (type === "email") {
          res = await updateUserEmail(currentUserId, newTarget.trim());
        } else if (type === "mobile") {
          res = await updateUserPhone(currentUserId, newTarget.trim());
        }

        setLoading(false);

        if (res.success) {
          setMsg({ type: "success", text: res.message });

          // ✅ Logout and redirect (if updating email)
          if (type === "email") {
            await logoutUser();
            setTimeout(() => (window.location.href = "/authentication"), 800);
          } else {
            setTimeout(() => {
                  window.location.reload(); // refresh page without logging out
                }, 800);
          }
        } else {
          setMsg({ type: "danger", text: res.message });
        }
      } catch (err) {
        console.error("Save Error:", err);
        setLoading(false);
        setMsg({ type: "danger", text: "Something went wrong while saving." });
      }
    };



  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="modal fade show d-block"
          role="dialog"
          aria-modal="true"
          ref={backdropRef}
          onMouseDown={onBackdropClick}
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: 'rgba(16,24,40,.45)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
          transition={{ duration: 0.18 }}
          style={{ backdropFilter: 'blur(1px)' }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <motion.div
              className="modal-content border-0 shadow-lg"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ borderRadius: '16px' }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  Update {channelLabel}
                </h5>

              </div>

              <div className="modal-body">
                {/* Current value (prefilled/read-only) */}
                <motion.div {...fade} className="mb-3">
                  <label className="form-label text-secondary">
                    Current {channelLabel}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      {type === 'email' ? <i className="bi bi-envelope" /> : <i className="bi bi-telephone" />}
                    </span>
                    <input
                      className="form-control"
                      value={value}
                      readOnly
                    />
                  </div>
                </motion.div>

                {/* New value field (always shown) */}
                <motion.div {...fade} className="mb-3">
                  <label className="form-label">
                    New {channelLabel}
                  </label>
                  <input
                    type="text"
                    className={`form-control ${newTarget && !validNewTarget ? 'is-invalid' : ''}`}
                    placeholder={type === 'email' ? 'name@example.com' : '+1 555 123 4567'}
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    disabled={otpVerified} // lock after verification if you want
                  />
                  {newTarget && !validNewTarget && (
                    <div className="invalid-feedback">
                      Enter a valid {channelLabel.toLowerCase()}.
                    </div>
                  )}
                </motion.div>

                {/* OTP phase */}
                <AnimatePresence mode="wait">
                  {!otpVerified && (
                    <motion.div key="otp-phase" {...fade}>
                      <div className="d-flex gap-2">
                        <input
                          className="form-control"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          style={{ maxWidth: 220 }}
                          disabled={!otpSent}
                        />
                        {!otpSent ? (
                          <button
                            className="btn btn-outline-dark"
                            onClick={handleSendOtp}
                            disabled={loading || !validNewTarget}
                          >
                            {loading ? (
                              <span className="spinner-border spinner-border-sm me-2" />
                            ) : null}
                            Send OTP
                          </button>
                        ) : (
                          <button
                            className="btn btn-success"
                            onClick={handleVerifyOtp}
                            disabled={loading || !otp}
                          >
                            {loading ? (
                              <span className="spinner-border spinner-border-sm me-2" />
                            ) : null}
                            Verify OTP
                          </button>
                        )}
                      </div>
                      <div className="form-text mt-1">
                        Check your inbox for the 6-digit code.
                      </div>
                    </motion.div>
                  )}

                  {otpVerified && (
                    <motion.div key="save-phase" {...fade} className="d-flex gap-2 align-items-start">
                      <button
                        className="btn btn-dark"
                        onClick={handleSave}
                        disabled={loading || !validNewTarget}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" />
                        ) : null}
                        Save Changes
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          // allow re-edit if needed
                          setOtpVerified(false);
                          setOtpSent(false);
                          setOtp('');
                        }}
                      >
                        Edit Again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message */}
                <AnimatePresence>
                  {msg && (
                    <motion.div {...fade} className={`alert alert-${msg.type} mt-3 mb-0 py-2`}>
                      {msg.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-danger" onClick={onClose}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
