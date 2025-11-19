// pages/DeliveryUpdatePage.jsx
import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import "bootstrap/dist/css/bootstrap.min.css";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export default function DeliveryUpdatePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [summaryOrder, setSummaryOrder] = useState(null); // from /api/ui/orders
  const [details, setDetails] = useState(null); // from /api/receiver/orders/{id}

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        // 1) get current orders
        const res = await fetch(`${BFF_BASE_URL}/api/ui/orders`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to load orders");
        }

        const json = await res.json();
        const current = json.current || [];

        if (!current.length) {
          setErr("No active rescues at the moment.");
          setLoading(false);
          return;
        }

        const first = current[0];
        setSummaryOrder(first);

        // 2) get receiver-side details using order id
        const detailRes = await fetch(
          `${BFF_BASE_URL}/api/receiver/orders/${first.id}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (!detailRes.ok) {
          const msg = await detailRes.text();
          throw new Error(msg || "Failed to load order details");
        }

        const detailJson = await detailRes.json();
        setDetails(detailJson);
      } catch (e) {
        console.error("delivery update error", e);
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="container py-4">
          <p>Loading delivery update…</p>
        </div>
      </div>
    );
  }

  if (err || !summaryOrder || !details) {
    return (
      <div>
        <div className="container py-4">
          <p className="text-danger">{err || "Unable to load delivery."}</p>
        </div>
      </div>
    );
  }

  const { lot, foodItems = [], donorName, receiverName, courierName } = details;
  const firstFood = foodItems[0] || {};
  const qtyLabel = firstFood.quantity && firstFood.unitOfMeasure
    ? `${firstFood.quantity} ${firstFood.unitOfMeasure}`
    : "";

  const status = details.status || summaryOrder.status || "CREATED";

  // ---------- progress bar logic ----------
  const stepLabels = ["Created", "Assigned", "Picked Up", "Delivered"];

  let activeIndex = 0;
  switch (status) {
    case "CREATED":
      activeIndex = 0;
      break;
    case "ASSIGNED":
      activeIndex = 1;
      break;
    case "IN_TRANSIT":
    case "PICKED_UP":
      activeIndex = 2;
      break;
    case "DELIVERED":
      activeIndex = 3;
      break;
    default:
      activeIndex = 0;
  }

  const deliveryOtp = details.deliveryOtp;

  return (
    <div>
      <div className="container py-4">
        <style>{`
          .delivery-card {
            border-radius: 24px;
            border: 1px solid #E5E7EB;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
            overflow: hidden;              /* ⬅️ keeps pills inside rounded border */
          }
          .delivery-header-icon {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            background:#EEF2FF;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#4F46E5;
          }
          .status-chip {
            border-radius:999px;
            font-weight:600;
            padding: .4rem 1rem;
            font-size:.8rem;
          }
          .lot-image {
            width: 132px;
            height: 132px;
            border-radius: 18px;
            object-fit: cover;
          }
          .pill-category {
            border-radius:999px;
            border:1px solid #E5E7EB;
            padding: .25rem .75rem;
            font-size:.8rem;
            background:#F9FAFB;
          }
          .otp-box {
            border-radius: 16px;
            background:#F9FAFB;
            border:1px dashed #E5E7EB;
            padding:1.25rem 1.5rem;
          }
          .otp-value {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: 0.12em;
          }
          .thin-divider {
            height: 1px;
            background:#E5E7EB;
            max-width: 95%;
            margin: 0.75rem auto 0;
          }
          /* progress bar */
          .status-progress {
            max-width: 520px;     /* a bit wider so pills breathe */
            margin-right: 4rem;   /* ⬅️ more space from the right edge */
          }
          .status-step {
            display:flex;
            align-items:center;
            flex:1;
            min-width:0;
          }
          .status-circle {
            /* pill size */
            height: 28px;
            min-width: 48px;              /* ⬅️ base width */
            padding: 0.15rem 0.9rem;      /* ⬅️ more horizontal padding */

            /* pill look */
            border-radius: 999px;
            border: 2px solid #CBD5F5;
            display: inline-flex;
            align-items: center;
            justify-content: center;

            /* text */
            font-size: 0.8rem;
            font-weight: 600;
            color: #64748b;
            background: #fff;
          }

          .status-circle.active {
            border-color:#16A34A;
            background:#16A34A;
            color:#fff;
          }
          .status-line {
            height: 2px;
            border-radius: 999px;
            background: #E5E7EB;
            margin: 0 10px;        /* horizontal spacing only */
            flex-grow: 1;
            align-self: center;    /* keep it vertically centered between pills */
          }

          .status-line.active {
            background: #16A34A;
          }

          .status-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            white-space: nowrap;

            /* ⬇️ make label sit above / cover the line */
            position: relative;
            z-index: 2;
            background: #fff;      /* same as card background */
            padding: 0 4px;        /* tiny padding so the line doesn't touch letters */
          }

          .status-label.active {
            color: #16A34A;
            font-weight: 600;
          }

          /* responsive tweaks */
          @media (max-width: 767.98px) {
            .lot-image {
              width: 96px;
              height: 96px;
            }
            .otp-box {
              padding: 1rem 1.1rem;
            }
          }
        `}</style>

        <div className="delivery-card bg-white p-3 p-md-4">
          {/* Header with progress bar */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
              <div className="delivery-header-icon">
                <i className="bi bi-box-seam" />
              </div>
              <div>
                <h5 className="mb-0">Delivery Update</h5>
                <small className="text-muted">
                  Track the live status of your rescue
                </small>
              </div>
            </div>

            {/* progress steps */}
            <div className="status-progress w-100 w-md-auto ms-md-3">
              <div className="d-flex align-items-center">
                {stepLabels.map((label, idx) => (
                  <React.Fragment key={label}>
                    <div className="status-step">
                      <div
                        className={
                          "status-circle " +
                          (idx <= activeIndex ? "active" : "")
                        }
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={
                          "status-label ms-2 " +
                          (idx <= activeIndex ? "active" : "text-muted")
                        }
                      >
                        {label}
                      </span>
                    </div>
                    {idx < stepLabels.length - 1 && (
                      <div
                        className={
                          "status-line flex-grow-1 " +
                          (idx < activeIndex ? "active" : "")
                        }
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Lot summary row */}
          <div className="row g-3 g-md-4 align-items-center mb-3 mb-md-4">
            <div className="col-auto">
              {lot?.imageUrl ? (
                <img
                  src={lot.imageUrl}
                  alt={lot.description || "Food lot"}
                  className="lot-image"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              ) : (
                <div className="lot-image bg-light d-flex align-items-center justify-content-center text-muted">
                  <i className="bi bi-image" />
                </div>
              )}
            </div>

            <div className="col">
              <h5 className="mb-1">{lot?.description || "Food Lot"}</h5>
              {/* Sourdough + 10 PCS inline */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {firstFood.itemName && (
                  <span className="text-muted">{firstFood.itemName}</span>
                )}
                {qtyLabel && (
                  <span className="text-muted small">• {qtyLabel}</span>
                )}
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {lot?.category && (
                  <span className="pill-category text-muted">
                    {lot.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* People row */}
          <div className="row text-muted small mb-3 mb-md-4">
            <div className="col-md-4 mb-2 mb-md-0">
              <div className="fw-semibold mb-1">
                <i className="bi bi-person me-2" />
                Donor
              </div>
              <div className="text-dark fw-semibold">{donorName}</div>
            </div>
            <div className="col-md-4 mb-2 mb-md-0">
              <div className="fw-semibold mb-1">
                <i className="bi bi-geo-alt me-2" />
                Receiver
              </div>
              <div className="text-dark fw-semibold">{receiverName}</div>
            </div>
            <div className="col-md-4">
              <div className="fw-semibold mb-1">
                <i className="bi bi-truck me-2" />
                Courier
              </div>
              <div className="text-dark fw-semibold">
                {courierName || "To be assigned"}
              </div>
            </div>
          </div>

          {/* OTP box */}
          <div className="otp-box d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div className="text-muted small mb-1">Delivery OTP</div>
              {deliveryOtp ? (
                <div className="otp-value">{deliveryOtp}</div>
              ) : (
                <div className="text-muted">
                  Will appear here once courier is assigned
                </div>
              )}
            </div>
            <div className="text-muted fs-4">
              <i className="bi bi-hash" />
            </div>
          </div>

          {/* slim divider */}
          <div className="thin-divider" />

          {/* IDs row */}
          <div className="row mt-3 text-muted small">
            <div className="col-md-4 mb-2 mb-md-0">
              <div className="fw-semibold">Order ID</div>
              <div className="text-dark">{details.orderId}</div>
            </div>
            <div className="col-md-4 mb-2 mb-md-0">
              <div className="fw-semibold">Job ID</div>
              <div className="text-dark">{details.jobId || "—"}</div>
            </div>
            <div className="col-md-4">
              <div className="fw-semibold">Lot ID</div>
              <div className="text-dark">{details.lotId}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
