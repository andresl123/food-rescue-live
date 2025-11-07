// components/dashboards/receiver/LotDetailsModal.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./css/LotDetailsModal.css";
import TagPill from "../../common/TagPill";

export default function LotDetailsModal({ lot, show, onClose, onReserve }) {
  if (!show) return null;

  // Lock body scroll while open (optional but nice)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const interestedCount =
    typeof lot.interested === "number"
      ? lot.interested
      : (lot.interested?.count ?? 0);

  const dialog = (
    <div
      className="frl-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${lot.title} details`}
    >
      <div className="frl-modal__backdrop" onClick={onClose} />

      <div className="frl-modal__dialog" role="document">
        {/* Header */}
        <div className="frl-modal__header">
          <h5 className="mb-0">{lot.title}</h5>
          <button className="btn-close" aria-label="Close" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="frl-modal__body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {lot.category && (
              <span className="badge rounded-pill text-bg-light border">
                <i className="bi bi-tag me-1" />
                {lot.category}
              </span>
            )}
            {lot.weightLbs != null && (
              <span className="badge rounded-pill text-bg-light border">
                <i className="bi bi-box-seam me-1" />
                {lot.weightLbs} lbs
              </span>
            )}
            {lot.distanceKm != null && (
              <span className="badge rounded-pill text-bg-light border">
                <i className="bi bi-geo-alt me-1" />
                {lot.distanceKm} km away
              </span>
            )}
            {lot.expiresAt && (
              <span className="badge rounded-pill text-bg-light border">
                <i className="bi bi-hourglass-split me-1" />
                Expires {new Date(lot.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-5">
              <div className="ratio ratio-4x3 rounded overflow-hidden border">
                <img
                  src={lot.imageUrl}
                  alt={lot.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>
            <div className="col-12 col-md-7">
              <p className="mb-3">{lot.description}</p>

              {!!(lot.items?.length) && (
                <>
                  <h6 className="fw-semibold">Items included</h6>
                  <ul className="frl-modal__chips list-unstyled mb-3">
                    {lot.items.map((it, idx) => (
                      <li key={idx} className="frl-chip">
                        <i className="bi bi-check2-circle me-2" />
                        <span className="text-truncate">{it}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {!!(lot.tags?.length) && (
                <>
                  <h6 className="fw-semibold">Tags</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="d-flex flex-wrap gap-2">
                      {lot.tags.map((t, i) => (
                        <TagPill key={i} label={t} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="frl-modal__footer">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn frl-btn-accent"
            onClick={() => onReserve?.(lot)}
          >
            <i className="bi bi-bag-plus me-2" />
            Reserve this lot
          </button>
        </div>
      </div>
    </div>
  );

  // Render to <body> so transforms in ancestors cannot offset it
  return createPortal(dialog, document.body);
}
