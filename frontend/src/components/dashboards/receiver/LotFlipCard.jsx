import React, { useMemo, useState } from "react";
import "./css/LotFlipCard.css";
import LotDetailsModal from "./LotDetailsModal";

export default function LotFlipCard({ lot, front }) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    if (Array.isArray(lot?.items) && lot.items.length) return lot.items;
    const desc = (lot?.description || "").trim();
    if (!desc) return [];
    const candidates = desc
      .split(/\n|,|•|–|-|\u2022/g)
      .map(s => s.trim())
      .filter(Boolean);
    return candidates.filter(s => s.length <= 40).slice(0, 15);
  }, [lot]);

  const onReserve = () => {
    // Plug your action here (toast, API call, etc.)
    // For now we just close:
    setOpen(false);
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

          {/* BACK (no tags here now) */}
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

      {/* Modal */}
      <LotDetailsModal
        lot={lot}
        show={open}
        onClose={() => setOpen(false)}
        onReserve={onReserve}
      />
    </>
  );
}
