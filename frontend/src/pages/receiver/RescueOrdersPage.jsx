// pages/RescueOrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import RescueOrderCard from "../../components/orders/RescueOrderCard";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal"; // ⬅️ new
import "bootstrap/dist/css/bootstrap.min.css";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export default function RescueOrdersPage() {
  const [tab, setTab] = useState("completed");
  const [data, setData] = useState({ current: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // NEW: modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${BFF_BASE_URL}/api/ui/orders`, {
          method: "GET",
          credentials: "include", // send cookies (httpOnly access_token)
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const msg = await res.text();
          setErr(msg || "Failed to load orders");
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData({
          current: json.current || [],
          completed: json.completed || [],
        });
      } catch (e) {
        console.error("orders fetch error", e);
        setErr("Network error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const { currentCount, completedCount, list } = useMemo(() => {
    const current = data?.current ?? [];
    const completed = data?.completed ?? [];
    return {
      currentCount: current.length,
      completedCount: completed.length,
      list: tab === "current" ? current : completed,
    };
  }, [data, tab]);

  const onViewDetails = (order) => {
    // open modal with this order
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <UserLayout>
      <div className="container py-4">
        <style>{`
          .pill-toggle { border-radius:14px; background:#f1f5f9; padding:.5rem; }
          .pill-btn { border:0; background:transparent; padding:.6rem 1rem; border-radius:10px; font-weight:600; color:#334155; }
          .pill-btn.active { background:#059669; color:#fff; }
          .pill-badge { display:inline-flex; align-items:center; gap:.4rem; }
          .pill-badge .dot { width:6px; height:6px; border-radius:999px; background:currentColor; display:inline-block; }
        `}</style>

        {/* Toggle */}
        <div className="d-flex justify-content-center mb-4">
          <div className="pill-toggle d-flex gap-2 shadow-sm">
            <button
              className={`pill-btn ${tab === "current" ? "active" : ""}`}
              onClick={() => setTab("current")}
              disabled={loading}
            >
              <span className="pill-badge">
                <i className="bi bi-clock-history"></i>
                Current Rescues
                <span className="badge bg-transparent border border-2 ms-1">
                  {currentCount}
                </span>
              </span>
            </button>
            <button
              className={`pill-btn ${tab === "completed" ? "active" : ""}`}
              onClick={() => setTab("completed")}
              disabled={loading}
            >
              <span className="pill-badge">
                <i className="bi bi-leaf"></i>
                Completed Rescues
                <span className="badge bg-transparent border border-2 ms-1">
                  {completedCount}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* States */}
        {loading && <p>Loading orders…</p>}
        {err && !loading && <p className="text-danger">{err}</p>}

        {/* Cards */}
        {!loading &&
          !err &&
          list.map((o) => (
            <RescueOrderCard key={o.id} order={o} onView={onViewDetails} />
          ))}

        {!loading && !err && list.length === 0 && (
          <p className="text-muted text-center mt-4">No orders in this tab.</p>
        )}
      </div>

      {/* NEW: modal render */}
      <OrderDetailsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        order={selectedOrder}
      />
    </UserLayout>
  );
}
