// components/dashboards/receiver/ConfirmReserveModal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./css/LotDetailsModal.css"; // reuse same shell styles

export default function ConfirmReserveModal({ lot, show, onCancel, onConfirm }) {
  // Always call hooks — never inside conditionals
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (show) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  if (!show) return null;

  return createPortal(
    <div className="frl-modal" role="dialog" aria-modal="true" aria-label="Confirm reservation">
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
          <div className="small text-muted">
            You can manage it from your dashboard afterwards.
          </div>
        </div>

        <div className="frl-modal__footer">
          <button className="btn btn-outline-secondary" onClick={onCancel}>
            No, cancel
          </button>
          <button className="btn btn-dark" onClick={() => onConfirm?.(lot)}>
            Yes, reserve
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
