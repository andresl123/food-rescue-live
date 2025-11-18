import React, { useMemo, useState } from "react";
import { Card, Button, Form, InputGroup, Badge } from "react-bootstrap";
import toast from "react-hot-toast";
import { verifyPodCode, updateJobStatus } from "../../services/podService.jsx";
import {
  markOrderDelivered,
  updateLotStatus,
} from "../../services/courierService.jsx";

const verificationCopy = {
  pickup: {
    title: "Pickup Proof of Delivery",
    primaryColor: "#ef4444",
    badgeVariant: "danger",
    locationLabel: "Pickup Location",
    idLabel: "Pickup ID",
    helperText: "Collect confirmation from the donor before leaving the site.",
  },
  delivery: {
    title: "Delivery Proof of Delivery",
    primaryColor: "#10b981",
    badgeVariant: "success",
    locationLabel: "Delivery Location",
    idLabel: "Delivery ID",
    helperText: "Confirm the recipient has received the items before completing the job.",
  },
};

function getVerificationConfig(type) {
  return verificationCopy[type] ?? verificationCopy.delivery;
}

export default function POD({
  jobData,
  verificationType = "delivery",
  onClose,
  onVerifyOTP,
  onScanQRCode,
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeMethod, setActiveMethod] = useState("otp");

  const config = useMemo(() => getVerificationConfig(verificationType), [verificationType]);

  const jobId = jobData?.id ?? jobData?.jobId ?? "N/A";
  const orderId = jobData?.orderId ?? "N/A";
  const lotIdFromJob = jobData?.lotId;

  const locationName =
    verificationType === "pickup"
      ? jobData?.donorName ?? "Donor location unavailable"
      : jobData?.recipientName ?? "Recipient location unavailable";

  const locationAddress =
    verificationType === "pickup"
      ? jobData?.donorAddress ?? "Donor address unavailable"
      : jobData?.recipientAddress ?? "Recipient address unavailable";

  const handleOtpChange = (event) => {
    const { value } = event.target;
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setOtp(sanitized);
    if (error && sanitized.length === 6) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP to continue.");
      return;
    }

    setSubmitting(true);
    try {
      if (onVerifyOTP) {
        await Promise.resolve(onVerifyOTP(otp, { jobData, verificationType }));
        await handlePostVerification();
        return;
      }

      const isValid = await verifyPodCode(jobId, verificationType, otp);
      if (isValid === true) {
        await handlePostVerification();
      } else {
        setError("Incorrect Code. Please try again.");
        toast.error("Invalid Code provided.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(
        err?.message ?? "Verification failed. Please re-check the OTP and try again."
      );
      toast.error("Unable to verify Code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostVerification = async () => {
    try {
      await updateJobStatus(jobId, verificationType);

      if (verificationType === "delivery" && orderId && orderId !== "N/A") {
        try {
          const orderUpdate = await markOrderDelivered(orderId);
          const lotId =
            lotIdFromJob ||
            orderUpdate?.lot_id ||
            orderUpdate?.lotId ||
            orderUpdate?.lotID ||
            orderUpdate?.lot;

          if (lotId) {
            try {
              await updateLotStatus(lotId, "DELIVERED");
            } catch (lotError) {
              console.error("Failed to update lot status:", lotError);
              toast.error(
                lotError?.message ||
                  "Order updated, but lot status change failed."
              );
            }
          }
        } catch (orderError) {
          console.error("Failed to update order status:", orderError);
          toast.error(
            orderError?.message ||
              "Delivery verified, but order status update failed."
          );
        }
      }

      toast.success(
        verificationType === "pickup"
          ? "Pickup OTP verified successfully."
          : "Delivery OTP verified successfully."
      );
      setOtp("");
      onClose?.();
    } catch (error) {
      console.error("Post verification handler failed:", error);
      toast.error(
        error?.message ??
          (verificationType === "pickup"
            ? "Pickup verified but status update failed."
            : "Verification completed but follow-up action failed.")
      );
    }
  };

  const handleScanQRCode = () => {
    if (onScanQRCode) {
      onScanQRCode({ jobData, verificationType });
    } else {
      console.info("QR scan requested. Provide onScanQRCode prop to handle this action.");
    }
  };

  return (
    <div
      className="w-100 py-3 px-3 px-md-4"
      style={{ minHeight: "85vh", backgroundColor: "#f9fafb" }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <small className="text-uppercase fw-semibold text-secondary d-block mb-1 small">
            Proof of Delivery
          </small>
          <h2 className="h5 fw-bold mb-0" style={{ color: "#111827" }}>
            {config.title}
          </h2>
        </div>
        {onClose && (
          <Button variant="dark" onClick={onClose} className="px-3 py-2">
            <i className="bi bi-arrow-left me-2" />
            Back to Dashboard
          </Button>
        )}
      </div>

      <div
        className="mx-auto mb-3"
        style={{ width: "50%", minWidth: "320px" }}
      >
        <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
          <Card.Body className="p-4 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-uppercase text-secondary fw-semibold small mb-1 text-muted">
                  Job Summary
                </p>
                <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center small">
                  <span className="fw-semibold text-dark">
                    <i className="bi bi-briefcase me-2 text-secondary" />
                    Job ID: {jobId}
                  </span>
                  <span className="text-muted">
                    <i className="bi bi-cart me-2 text-secondary" />
                    Order ID: {orderId}
                  </span>
                </div>
              </div>
              <Badge bg={config.badgeVariant} className="px-2 py-1 text-uppercase small">
                {verificationType === "pickup" ? "Pickup" : "Delivery"}
              </Badge>
            </div>

            <div
              className="p-3 rounded-4"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: config.primaryColor,
                    color: "#fff",
                  }}
                >
                  <i className="bi bi-geo-alt" />
                </div>
                <div>
                  <p className="text-uppercase small fw-semibold text-secondary mb-1">
                    {config.locationLabel}
                  </p>
                  <h5 className="mb-1 h6" style={{ color: "#111827" }}>
                    {locationName}
                  </h5>
                  <p className="text-muted mb-0 small">{locationAddress}</p>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div
        className="mx-auto mb-3"
        style={{ width: "50%", minWidth: "320px" }}
      >
        <div className="btn-group d-flex">
          <Button
            variant={activeMethod === "otp" ? "dark" : "outline-dark"}
            className="fw-semibold flex-fill"
            onClick={() => setActiveMethod("otp")}
          >
            <i className="bi bi-shield-lock me-2" />
            Verification Code
          </Button>
          <Button
            variant={activeMethod === "qr" ? "dark" : "outline-dark"}
            className="fw-semibold flex-fill"
            onClick={() => setActiveMethod("qr")}
          >
            <i className="bi bi-qr-code me-2" />
            QR Verification
          </Button>
        </div>
      </div>

      <div
        className="mx-auto"
        style={{ width: "50%", minWidth: "320px" }}
      >
        {activeMethod === "otp" ? (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
            <Card.Body className="p-4 p-md-4">
            <Form onSubmit={handleSubmit}>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="fw-semibold mb-0 small">
                    Enter 6-digit Verification Code
                  </Form.Label>
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 text-dark fw-semibold"
                    onClick={() => setOtp("")}
                  >
                    Reset
                  </Button>
                </div>
                <InputGroup className="mb-2">
                  <InputGroup.Text>
                    <i className="bi bi-shield-lock" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                  placeholder="••••••"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                  />
                </InputGroup>
                <small className="text-muted">
                  Share the code screen with the {verificationType === "pickup" ? "donor" : "recipient"} to verify the handoff.
                </small>
                {error && <div className="text-danger small mt-2">{error}</div>}
              </div>

              <Button
                type="submit"
                className="w-100 py-2 fw-semibold"
                variant="dark"
                style={{ borderRadius: "10px" }}
                disabled={submitting}
              >
                {submitting ? "Verifying..." : "Verify Code"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
        ) : (
          <Card className="border-0 shadow-sm" style={{ borderRadius: "14px" }}>
            <Card.Body className="p-4 p-md-4 d-flex flex-column">
            <div className="mb-3">
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                Scan To Verify
              </p>
              <h3 className="h6 fw-bold text-dark mb-2">Verify via QR Code</h3>
              <p className="text-muted mb-0 small">
                Ask the {verificationType === "pickup" ? "donor" : "recipient"} to share their verification QR code. Scan it to automatically complete the proof of delivery.
              </p>
            </div>

            <div
              className="flex-grow-1 d-flex align-items-center justify-content-center rounded-4 mb-3"
              style={{
                border: "1px dashed #d1d5db",
                backgroundColor: "#f3f4f6",
              }}
            >
              <div className="text-center">
                <i
                  className="bi bi-qr-code"
                  style={{ fontSize: "2.5rem", color: config.primaryColor }}
                />
                <p className="text-muted mt-2 mb-0 small">
                  Ready to scan for job {jobId}
                </p>
              </div>
            </div>

            <Button
              variant="dark"
              className="py-2 fw-semibold"
              style={{ borderRadius: "10px" }}
              onClick={handleScanQRCode}
            >
              <i className="bi bi-camera me-2" />
              Scan QR Code
            </Button>

            <div className="mt-3 pt-3 border-top">
              <small className="text-muted d-block small">
                <i className="bi bi-info-circle me-2" />
                {config.helperText}
              </small>
            </div>
          </Card.Body>
        </Card>
        )}
      </div>
    </div>
  );
}

