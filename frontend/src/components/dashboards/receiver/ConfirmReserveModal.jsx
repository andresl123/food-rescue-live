import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./css/LotDetailsModal.css";
import toast from "react-hot-toast";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export default function ConfirmReserveModal({ lot, show, onCancel, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (show) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      setSubmitting(false);
    };
  }, [show]);

  if (!show) return null;

  const handleReserve = async () => {
    const lotId = lot?.id ?? lot?.lotId;
    if (!lotId) {
      toast.error("Lot id is missing.");
      return;
    }

    setSubmitting(true);

    try {
      const resp = await fetch(
        `${BFF_BASE_URL}/api/r_dashboard/reserve/${lotId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!resp.ok) {
        let msg = "Failed to reserve lot.";

        const body = await resp.json().catch(() => null);

        if (resp.status === 409) {
          msg =
            "You already have an active order pending delivery.";
        } else if (body) {
          msg =
            body.message ||
            body.error ||
            body.detail ||
            resp.statusText ||
            msg;
        } else if (resp.statusText) {
          msg = resp.statusText;
        }

        toast.error(msg);
        return;
      }

      toast.success("Lot reserved successfully.");
      onConfirm?.(lot);
    } catch (err) {
      const msg = err?.message || "Failed to reserve lot.";
      toast.error(msg);
      // no rethrow
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
          <div className="small text-muted mb-0">
            You can manage it from your dashboard afterwards.
          </div>
          {/* no red alert here */}
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
