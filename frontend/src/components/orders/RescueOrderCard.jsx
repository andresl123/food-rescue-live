import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export default function RescueOrderCard({ order, onView }) {
  const {
    id,
    date, // "Oct 29, 2025 at 06:00 PM"
    status,
    donor, // { name, address }
    recipient, // { name, address }
    items = [], // [{ name, qty, unit }]
    courier, // { name, phone }
  } = order;

  const [deliveryOtp, setDeliveryOtp] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // fetch OTP when order is READY (won't show on completed, but safe)
  useEffect(() => {
    if (status !== "READY") {
      setDeliveryOtp(null);
      return;
    }

    const fetchOtp = async () => {
      try {
        setOtpLoading(true);
        const res = await fetch(
          `${BFF_BASE_URL}/api/receiver/otp/delivery/${id}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (res.ok) {
          const json = await res.json(); // { deliveryOtp: "123456" }
          setDeliveryOtp(json.deliveryOtp ?? null);
        } else {
          setDeliveryOtp(null);
        }
      } catch (e) {
        console.error("Failed to fetch delivery OTP", e);
        setDeliveryOtp(null);
      } finally {
        setOtpLoading(false);
      }
    };

    fetchOtp();
  }, [id, status]);

  const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const unit = items[0]?.unit || "";

  const badgeCls =
    {
      COMPLETED: "bg-success",
      READY: "bg-primary",
      IN_TRANSIT: "bg-warning text-dark",
      CANCELLED: "bg-secondary",
    }[status] || "bg-secondary";

  const shownItems = items.slice(0, 3);
  const moreCount = Math.max(items.length - shownItems.length, 0);

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3 w-100">
      <style>{`
        .soft-tile {
          background:#F7F8FA;
          border:1px solid #E7EAF0;
          border-radius:12px;
          padding:1rem 1.25rem;
        }
        .rescue-chip {
          background:#F7F8FA;
          border:1px solid #E7EAF0;
          border-radius:14px;
          padding:.5rem .65rem;
        }
        .rescue-divider {
          height:0.5px;
          background:#EEF1F4;
          width:100%;
          margin:0 auto;
        }
        .status-badge { border-radius:999px; font-weight:600; }

        .food-grid{
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        /* BIGGER OTP PILL */
        .otp-pill {
          border-radius:999px;
          border:1px solid #16a34a33;
          background:#ecfdf3;
          color:#16a34a;
          padding:0.55rem 1.1rem;
          font-size:0.95rem;
          font-weight:600;
          white-space:nowrap;
        }
        .otp-pill i {
          font-size:1.1rem;
        }

        @media (max-width: 576px) {
          .card-header-id {
            font-size: 0.9rem;
            word-break: break-all;
          }
        }
      `}</style>

      {/* Header – stacked on mobile, row on md+ */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 p-3 p-md-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-wrap">
          <span className="fw-semibold card-header-id">{id}</span>
          <span className="text-body-secondary d-none d-sm-inline">•</span>
          <span className="text-body-secondary">
            <i className="bi bi-calendar3 me-2" />
            {date}
          </span>
        </div>

        {/* Status + OTP pill (wraps nicely on small screens) */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className={`status-badge px-3 py-2 text-white ${badgeCls}`}>
            <i className="bi bi-check2-circle me-1" />
            {status}
          </span>

          {status === "READY" && (
            <span className="otp-pill d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill" />
              {otpLoading
                ? "Fetching OTP…"
                : deliveryOtp
                ? `OTP: ${deliveryOtp}`
                : "OTP not available"}
            </span>
          )}
        </div>
      </div>

      <div className="rescue-divider" />

      {/* Body */}
      <div className="p-3 p-md-4">
        <div className="row g-3">
          {/* Donor */}
          <div className="col-12 col-md-6">
            <div className="mb-2 text-body-secondary">
              <i className="bi bi-geo-alt me-2" />
              Donor
            </div>
            <div className="soft-tile h-100">
              <div className="fw-semibold">{donor?.name}</div>
              <div className="text-body-secondary mt-1">{donor?.address}</div>
            </div>
          </div>

          {/* Recipient */}
          <div className="col-12 col-md-6">
            <div className="mb-2 text-body-secondary">
              <i className="bi bi-geo-alt me-2" />
              Recipient
            </div>
            <div className="soft-tile h-100">
              <div className="fw-semibold">{recipient?.name}</div>
              <div className="text-body-secondary mt-1">
                {recipient?.address}
              </div>
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
                <div className="text-body-secondary">
                  {it.qty} {it.unit}
                </div>
              </div>
            ))}
            {moreCount > 0 && (
              <div className="rescue-chip d-flex align-items-center justify-content-center">
                <span className="fw-semibold">+{moreCount} more</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer – stacks on mobile */}
        <div className="mt-4 pt-3 rescue-divider" />
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 pt-3">
          <div className="d-flex flex-row flex-wrap align-items-center gap-2">
            <i className="bi bi-person-circle text-body-secondary fs-5" />
            <div>
              <div className="text-body-secondary small">Courier</div>
              <div className="fw-semibold">{courier?.name}</div>
            </div>
            <div className="vr mx-2 d-none d-md-block" />
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-telephone text-body-secondary" />
              <span className="text-body-secondary">{courier?.phone}</span>
            </div>
          </div>

          <button
            className="btn btn-success d-flex align-items-center justify-content-center gap-2 px-3"
            onClick={() => onView?.(order)}
          >
            View Details <i className="bi bi-arrow-right-short fs-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
