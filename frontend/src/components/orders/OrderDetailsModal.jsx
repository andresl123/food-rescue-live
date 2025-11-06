import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const LOT_API_BASE = "http://localhost:8090";

export default function OrderDetailsModal({ show, onClose, order }) {
  const [lot, setLot] = useState(null);
  const [lotLoading, setLotLoading] = useState(false);
  const [lotError, setLotError] = useState("");
  const [imgBroken, setImgBroken] = useState(false);

  // ratings (bottom)
  const [lotRating, setLotRating] = useState(0);
  const [lotHoverRating, setLotHoverRating] = useState(0);
  const [lotFeedback, setLotFeedback] = useState("");

  const [courierRating, setCourierRating] = useState(0);
  const [courierHoverRating, setCourierHoverRating] = useState(0);
  const [courierFeedback, setCourierFeedback] = useState("");

  // lock scroll
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // fetch lot
  useEffect(() => {
    if (!show || !order?.lotId) {
      setLot(null);
      return;
    }

    const fetchLot = async () => {
      setLotLoading(true);
      setLotError("");
      setImgBroken(false);

      try {
        const res = await fetch(
          `${LOT_API_BASE}/api/lots/${order.lotId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );
        if (!res.ok) {
          setLotError("Unable to load lot details");
          setLot(null);
        } else {
          const json = await res.json();
          console.log("[OrderDetailsModal] lot response:", json);
          setLot(json.data || null);
        }
      } catch (err) {
        console.error("lot fetch error", err);
        setLotError("Network error");
        setLot(null);
      } finally {
        setLotLoading(false);
      }
    };

    fetchLot();
  }, [show, order?.lotId]);

  if (!show || !order) return null;

  const {
    id,
    date,
    status,
    donor,
    recipient,
    items = [],
    courier,
  } = order;

  const shownItems = items.slice(0, 6);
  const moreCount = Math.max(items.length - shownItems.length, 0);

  // try all image keys
  const imgSrc =
    (lot && (lot.imageUrl || lot.imageURL || lot.image_url)) || "";

  const handleSubmitLot = (e) => {
    e.preventDefault();
    console.log("Lot rating:", lotRating, "Lot feedback:", lotFeedback);
  };

  const handleSubmitCourier = (e) => {
    e.preventDefault();
    console.log(
      "Courier rating:",
      courierRating,
      "Courier feedback:",
      courierFeedback
    );
  };

  // tiny svg star component
  const Star = ({ active }) => (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      style={{
        fill: active ? "#F5B400" : "none",
        stroke: active ? "#F5B400" : "#d1d5db",
        strokeWidth: 1.3,
        transition: "transform .12s ease",
      }}
    >
      <path d="M12 3.5l2.4 4.86 5.36.78-3.88 3.78.92 5.35L12 15.9l-4.8 2.53.92-5.35L4.25 9.14l5.36-.78L12 3.5z" />
    </svg>
  );

  const dialog = (
    <div className="frl-order-modal" role="dialog" aria-modal="true">
      <style>{`
        .frl-order-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
        }
        .frl-order-modal__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(2px);
        }
        .frl-order-modal__panel {
          position: relative;
          max-width: 980px;
          margin: 3rem auto;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 6rem);
          box-shadow: 0 24px 60px rgba(15,23,42,0.12);
        }
        .frl-order-modal__header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:1rem;
        }
        .frl-order-modal__body {
          padding: 1.25rem 1.5rem 1.25rem;
          overflow-y: auto;
          background:#f8fafc;
        }
        .frl-order-modal__footer {
          padding:.75rem 1.5rem;
          border-top:1px solid #e2e8f0;
          background:#fff;
          display:flex;
          justify-content:flex-end;
        }
        .frl-status-pill {
          border-radius:999px;
          padding:.25rem .9rem;
          font-size:.7rem;
          font-weight:600;
        }
        .frl-section-title {
          font-size:.68rem;
          text-transform:uppercase;
          letter-spacing:.04em;
          color:#6b7280;
          margin-bottom:.45rem;
          display:flex;
          align-items:center;
          gap:.35rem;
        }

        /* LOT SECTION */
        .frl-lot-section {
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:14px;
          padding:1rem 1.2rem 1.1rem;
          margin-bottom:1.25rem;
          display:flex;
          gap:1.25rem;
        }
        .frl-lot-left {
          width:230px;
          flex:0 0 230px;
          display:flex;
          flex-direction:column;
          gap:.5rem;
        }

        /* match your LotDetailsModal style */
        .frl-lot-img-wrapper {
          width:100%;
        }
        .frl-lot-img-wrapper .ratio {
          background:#e2e8f0;
        }
        .frl-lot-img-wrapper img {
          object-fit:cover;
        }

        .frl-lot-placeholder {
          width:100%;
          height:140px;
          border-radius:12px;
          border:1px solid #e2e8f0;
          background:#e2e8f0;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:.7rem;
          color:#94a3b8;
        }

        .frl-lot-tags {
          display:flex;
          flex-wrap:wrap;
          gap:.4rem;
        }
        .frl-tag-pill {
          background:#ecfdf3;
          border:1px solid rgba(22,101,52,0.15);
          border-radius:999px;
          padding:.25rem .55rem;
          font-size:.6rem;
          color:#166534;
        }
        .frl-lot-right {
          flex:1 1 auto;
          display:flex;
          flex-direction:column;
          gap:.65rem;
        }
        .frl-lot-desc {
          font-size:.75rem;
          color:#334155;
        }
        .frl-items-row {
          display:flex;
          flex-wrap:wrap;
          gap:.5rem;
        }
        .frl-item-chip {
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:12px;
          padding:.5rem .75rem;
          min-width:120px;
        }

        /* info cards */
        .frl-bottom-flex {
          display:flex;
          gap:1rem;
          margin-bottom:1.25rem;
        }
        .frl-bottom-card {
          flex:1 1 0;
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:14px;
          padding:.8rem 1rem 1rem;
        }

        /* rating blocks */
        .frl-rating-blocks {
          display:flex;
          gap:1rem;
          margin-bottom:1rem;
        }
        .frl-rating-card {
          flex:1 1 0;
          background:#fff;
          border:1px solid #e2e8f0;
          border-radius:14px;
          padding:1rem 1rem 1rem;
        }
        .frl-rating-card h6 {
          font-size:.9rem;
          margin-bottom:.75rem;
        }
        .frl-stars-row {
          display:flex;
          gap:.35rem;
          margin-bottom:.75rem;
        }
        .frl-star-btn {
          border:none;
          background:transparent;
          cursor:pointer;
          transition:transform .12s ease;
        }
        .frl-star-btn:hover {
          transform: translateY(-2px) scale(1.04);
        }
        .frl-rating-textarea {
          background:#f1f2f4;
          border:1px solid transparent;
          border-radius:14px;
          width:100%;
          min-height:70px;
          resize:vertical;
          padding:.6rem .7rem;
          font-size:.75rem;
          outline:none;
        }
        .frl-rating-textarea:focus {
          border-color:#cbd5f5;
          background:#fff;
        }
        .frl-rating-actions {
          display:flex;
          justify-content:flex-end;
          margin-top:.65rem;
        }

        @media (max-width: 992px) {
          .frl-order-modal__panel {
            max-width: min(100vw - 1.5rem, 980px);
            margin: 1.5rem auto;
          }
          .frl-lot-section {
            flex-direction:column;
          }
          .frl-lot-left {
            width:100%;
            flex:0 0 auto;
            flex-direction:row;
          }
          .frl-bottom-flex,
          .frl-rating-blocks {
            flex-direction:column;
          }
        }
      `}</style>

      <div className="frl-order-modal__backdrop" onClick={onClose} />

      <div className="frl-order-modal__panel" role="document">
        {/* HEADER */}
        <div className="frl-order-modal__header">
          <div>
            <h5 className="mb-0">Order Details</h5>
            <small className="text-muted">
              {id} • {date}
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              className={`frl-status-pill ${
                status === "READY"
                  ? "bg-success-subtle text-success"
                  : status === "COMPLETED"
                  ? "bg-success text-white"
                  : "bg-secondary text-white"
              }`}
            >
              {status}
            </span>
            <button className="btn-close" onClick={onClose} />
          </div>
        </div>

        {/* BODY */}
        <div className="frl-order-modal__body">
          {/* LOT SECTION */}
          <div className="frl-lot-section">
            <div className="frl-lot-left">
              {/* this part now behaves like your LotDetailsModal */}
              {imgSrc && !imgBroken ? (
                <div className="frl-lot-img-wrapper">
                  <div className="ratio ratio-4x3 rounded overflow-hidden border">
                    <img
                      src={imgSrc}
                      alt={lot?.description || "Lot image"}
                      className="w-100 h-100"
                      onError={() => setImgBroken(true)}
                    />
                  </div>
                </div>
              ) : (
                <div className="frl-lot-placeholder">No image available</div>
              )}

            </div>

            <div className="frl-lot-right">
              <p className="frl-section-title">
                <i className="bi bi-basket" /> Lot Info
              </p>
              <p className="frl-lot-desc mb-1">
                {lotLoading
                  ? "Loading lot details…"
                  : lotError
                  ? lotError
                  : lot?.description || "No description for this lot."}
              </p>

              {/* Food items in lot section */}
              <div>
                <p className="frl-section-title mb-2">
                  <i className="bi bi-box-seam" /> Food Items ({items.length})
                </p>
                <div className="frl-items-row">
                  {shownItems.map((it, idx) => (
                    <div key={idx} className="frl-item-chip">
                      <div className="fw-semibold">{it.name}</div>
                      <div className="text-muted small">
                        {it.qty} {it.unit}
                      </div>
                    </div>
                  ))}
                  {moreCount > 0 && (
                    <div className="frl-item-chip">
                      <div className="fw-semibold">+{moreCount} more</div>
                      <div className="text-muted small">items</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INFO ROW */}
          <div className="frl-bottom-flex">
            <div className="frl-bottom-card">
              <p className="frl-section-title">
                <i className="bi bi-geo-alt" /> Donor
              </p>
              <div className="fw-semibold">{donor?.name}</div>
              <div className="text-muted small mt-1">{donor?.address}</div>
            </div>

            <div className="frl-bottom-card">
              <p className="frl-section-title">
                <i className="bi bi-geo-alt" /> Recipient
              </p>
              <div className="fw-semibold">{recipient?.name}</div>
              <div className="text-muted small mt-1">{recipient?.address}</div>
            </div>

            <div className="frl-bottom-card">
              <p className="frl-section-title">
                <i className="bi bi-person-vcard" /> Courier
              </p>
              <div className="fw-semibold">
                {courier?.name || "To be assigned"}
              </div>
              <div className="text-muted small">
                {courier?.phone || "To be assigned"}
              </div>
            </div>
          </div>

          {/* RATING SECTION AT END */}
          <div className="frl-rating-blocks">
            {/* LOT RATING */}
            <div className="frl-rating-card">
              <h6>How would you rate this lot?</h6>
              <div className="frl-stars-row">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = lotHoverRating
                    ? lotHoverRating >= n
                    : lotRating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      className="frl-star-btn"
                      onClick={() => setLotRating(n)}
                      onMouseEnter={() => setLotHoverRating(n)}
                      onMouseLeave={() => setLotHoverRating(0)}
                    >
                      <Star active={active} />
                    </button>
                  );
                })}
              </div>
              <form onSubmit={handleSubmitLot}>
                <label className="small mb-1 d-block fw-semibold">
                  Your Feedback
                </label>
                <textarea
                  className="frl-rating-textarea"
                  value={lotFeedback}
                  onChange={(e) => setLotFeedback(e.target.value)}
                  placeholder="Please share your experience with this lot (quality, packaging, accuracy, etc.)"
                />
                <div className="frl-rating-actions">
                  <button type="submit" className="btn btn-sm btn-success">
                    Submit
                  </button>
                </div>
              </form>
            </div>

            {/* COURIER RATING */}
            <div className="frl-rating-card">
              <h6>How would you rate the courier?</h6>
              <div className="frl-stars-row">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = courierHoverRating
                    ? courierHoverRating >= n
                    : courierRating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      className="frl-star-btn"
                      onClick={() => setCourierRating(n)}
                      onMouseEnter={() => setCourierHoverRating(n)}
                      onMouseLeave={() => setCourierHoverRating(0)}
                    >
                      <Star active={active} />
                    </button>
                  );
                })}
              </div>
              <form onSubmit={handleSubmitCourier}>
                <label className="small mb-1 d-block fw-semibold">
                  Your Feedback
                </label>
                <textarea
                  className="frl-rating-textarea"
                  value={courierFeedback}
                  onChange={(e) => setCourierFeedback(e.target.value)}
                  placeholder="Please share your experience with the courier (timeliness, behavior, communication, etc.)"
                />
                <div className="frl-rating-actions">
                  <button
                    type="submit"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="frl-order-modal__footer">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
