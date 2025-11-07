import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function RescueOrderCard({ order, onView }) {
  const {
    id,
    date,             // "Oct 29, 2025 at 06:00 PM"
    status,           // "COMPLETED" | "IN_TRANSIT" | "READY" ...
    donor,            // { name, address }  (address string)
    recipient,        // { name, address }  (address string)
    items = [],       // [{ name, qty, unit }]
    courier           // { name, phone }
  } = order;

  const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const unit = items[0]?.unit || "";

  const badgeCls = {
    COMPLETED: "bg-success",
    READY: "bg-primary",
    IN_TRANSIT: "bg-warning text-dark",
    CANCELLED: "bg-secondary",
  }[status] || "bg-secondary";

  // show at most 3 items, then "+N more"
  const shownItems = items.slice(0, 3);
  const moreCount = Math.max(items.length - shownItems.length, 0);

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <style>{`
        .soft-tile {
          background:#F7F8FA;            /* same bg as food item chips */
          border:1px solid #E7EAF0;
          border-radius:12px;
          padding:1rem 1.25rem;
        }
        .rescue-chip {
          background:#F7F8FA;
          border:1px solid #E7EAF0;
          border-radius:14px;
          padding:.5rem .75rem;
        }
        .rescue-divider {
          height:0.5px;
          background:#EEF1F4;
          width:100%;
          margin:0 auto;         /* centered */
        }
        .status-badge { border-radius:999px; font-weight:600; }

        .food-grid{
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); /* narrower */
          gap: 12px;
        }
        .rescue-chip {
          background:#F7F8FA;
          border:1px solid #E7EAF0;
          border-radius:14px;
          padding:.5rem .65rem;          /* a bit tighter */
        }
      `}</style>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 p-md-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="fw-semibold">{id}</span>
          <span className="text-body-secondary">•</span>
          <span className="text-body-secondary">
            <i className="bi bi-calendar3 me-2" />
            {date}
          </span>
        </div>

        <span className={`status-badge px-3 py-2 text-white ${badgeCls}`}>
          <i className="bi bi-check2-circle me-1" />
          {status}
        </span>
      </div>

      <div className="rescue-divider" />

      {/* Body */}
      <div className="p-3 p-md-4">
        <div className="row g-3">
          {/* Donor */}
          <div className="col-md-6">
            <div className="mb-2 text-body-secondary">
              <i className="bi bi-geo-alt me-2" />
              Donor
            </div>
            <div className="soft-tile">
              <div className="fw-semibold">{donor?.name}</div>
              <div className="text-body-secondary mt-1">{donor?.address}</div>
            </div>
          </div>

          {/* Recipient */}
          <div className="col-md-6">
            <div className="mb-2 text-body-secondary">
              <i className="bi bi-geo-alt me-2" />
              Recipient
            </div>
            <div className="soft-tile">
              <div className="fw-semibold">{recipient?.name}</div>
              <div className="text-body-secondary mt-1">{recipient?.address}</div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4">
          <div className="mb-2 text-body-secondary">
            <i className="bi bi-box-seam me-2" />
            Food Items ({items.length} items • {totalQty} {unit} total)
          </div>

          <div className="food-grid">
            {shownItems.map((it, idx) => (
              <div className="rescue-chip" key={idx}>
                <div className="fw-semibold">{it.name}</div>
                <div className="text-body-secondary">{it.qty} {it.unit}</div>
              </div>
            ))}
            {moreCount > 0 && (
              <div className="rescue-chip d-flex align-items-center justify-content-center">
                <span className="fw-semibold">+{moreCount} more</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 rescue-divider" />
        <div className="d-flex align-items-center justify-content-between pt-3">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-person-circle text-body-secondary fs-5" />
            <div>
              <div className="text-body-secondary small">Courier</div>
              <div className="fw-semibold">{courier?.name}</div>
            </div>
            <div className="vr mx-2" />
            <i className="bi bi-telephone text-body-secondary" />
            <span className="text-body-secondary">{courier?.phone}</span>
          </div>

          <button
            className="btn btn-success d-flex align-items-center gap-2 px-3"
            onClick={() => onView?.(order)}
          >
            View Details <i className="bi bi-arrow-right-short fs-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
