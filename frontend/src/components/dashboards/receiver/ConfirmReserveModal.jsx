import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./css/LotDetailsModal.css"; // reuse same shell styles

const BFF_BASE_URL = "http://localhost:8090";

export default function ConfirmReserveModal({ lot, show, onCancel, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (show) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      setSubmitting(false);
      setError("");
    };
  }, [show]);

  if (!show) return null;

  const handleReserve = async () => {
    const lotId = lot?.id ?? lot?.lotId;
    if (!lotId) {
      setError("Lot id is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const resp = await fetch(
        `${BFF_BASE_URL}/api/r_dashboard/reserve/${lotId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const msg = body.message || body.error || resp.statusText;
        throw new Error(msg);
      }

      // success — let parent handle navigation / closing
      onConfirm?.(lot);
    } catch (e) {
      setError(e.message || "Failed to reserve lot.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="frl-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm reservation"
    >
      <div className="frl-modal__backdrop" onClick={onCancel} />

      <div className="frl-modal__dialog frl-modal__dialog--sm" role="document">
        <div className="frl-modal__header">
          <h6 className="mb-0">Confirm reservation</h6>
          <button className="btn-close" aria-label="Close" onClick={onCancel} />
        </div>

        <div className="frl-modal__body">
          <p className="mb-2">
            Reserve <strong>{lot?.title ?? "this lot"}</strong>?
          </p>
          <div className="small text-muted mb-2">
            You can manage it from your dashboard afterwards.
          </div>
          {error && (
            <div className="alert alert-danger py-2 mb-0">{error}</div>
          )}
        </div>

        <div className="frl-modal__footer">
          <button
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            No, cancel
          </button>
          <button
            className="btn btn-dark"
            onClick={handleReserve}
            disabled={submitting}
          >
            {submitting ? "Reserving..." : "Yes, reserve"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
