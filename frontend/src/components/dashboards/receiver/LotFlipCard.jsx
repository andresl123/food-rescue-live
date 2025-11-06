import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/LotFlipCard.css";
import LotDetailsModal from "./LotDetailsModal";
import ConfirmReserveModal from "./ConfirmReserveModal";

export default function LotFlipCard({ lot, front }) {
  const [open, setOpen] = useState(false);           // details modal
  const [confirmOpen, setConfirmOpen] = useState(false); // confirm modal
  const navigate = useNavigate();

  const items = useMemo(() => {
    if (Array.isArray(lot?.items) && lot.items.length) return lot.items;
    const desc = (lot?.description || "").trim();
    if (!desc) return [];
    const candidates = desc
      .split(/\n|,|•|–|-|\u2022/g)
      .map((s) => s.trim())
      .filter(Boolean);
    return candidates.filter((s) => s.length <= 40).slice(0, 15);
  }, [lot]);

  // this gets called from LotDetailsModal -> "Reserve this lot"
  const onReserve = () => {
    // close details modal
    setOpen(false);
    // open confirm modal
    setConfirmOpen(true);
  };

  // this gets called from ConfirmReserveModal AFTER API success
  const handleConfirmSuccess = () => {
    setConfirmOpen(false);
    // go to dashboard and refresh
    window.location.href = "/dashboard";
    // if you prefer react-router-only:
    // navigate("/dashboard", { replace: true });
    // navigate(0);
  };

  return (
    <>
      <div
        className="frl-flip"
        tabIndex={0}
        aria-label={`View items in ${lot?.title ?? "lot"}`}
      >
        <div className="frl-flip-inner">
          {/* FRONT */}
          <div className="frl-flip-face frl-flip-front">{front}</div>

          {/* BACK */}
          <div className="frl-flip-face frl-flip-back">
            <div className="frl-back-hero">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-semibold text-dark">In this lot</h6>
                {lot?.weightLbs != null && (
                  <span className="badge rounded-pill text-bg-light border">
                    {lot.weightLbs} lbs
                  </span>
                )}
              </div>
              {lot?.locationName && (
                <div className="small text-muted mt-1">
                  <i className="bi bi-geo-alt me-1" />
                  {lot.locationName}
                </div>
              )}
            </div>

            <div className="frl-back-body">
              {items.length > 0 ? (
                <ul className="frl-item-grid list-unstyled">
                  {items.map((it, idx) => (
                    <li key={idx} className="frl-chip" title={it}>
                      <i className="bi bi-check2-circle me-2" />
                      <span className="text-truncate">{it}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted small">
                  Item details not provided for this lot.
                </div>
              )}
            </div>

            <div className="frl-back-footer">
              <button
                type="button"
                className="btn frl-btn-accent w-100"
                onClick={() => setOpen(true)}
              >
                Click to view full details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details modal */}
      <LotDetailsModal
        lot={lot}
        show={open}
        onClose={() => setOpen(false)}
        onReserve={onReserve}
      />

      {/* Confirm modal that actually hits the API */}
      <ConfirmReserveModal
        lot={lot}
        show={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSuccess}
      />
    </>
  );
}
