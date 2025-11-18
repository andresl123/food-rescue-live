// pages/RescueOrdersPage.jsx
import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import RescueOrderCard from "../../components/orders/RescueOrderCard";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal";
import "bootstrap/dist/css/bootstrap.min.css";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export default function RescueOrdersPage() {
  const [orders, setOrders] = useState([]);        // only completed orders
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${BFF_BASE_URL}/api/ui/orders`, {
          method: "GET",
          credentials: "include",
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
        // 🔹 Only keep completed / past orders
        setOrders(json.completed || []);
      } catch (e) {
        console.error("orders fetch error", e);
        setErr("Network error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const onViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <UserLayout>
      <div className="container py-4">
        <style>{`
          .rescue-page-title {
            font-weight: 700;
            letter-spacing: 0.02em;
          }
          .rescue-page-subtitle {
            max-width: 520px;
          }
        `}</style>

        {/* Header text – responsive alignment */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
          <div>
            <h2 className="rescue-page-title mb-1">Your Past Rescues</h2>
            <p className="text-muted rescue-page-subtitle mb-0">
              A history of all completed food rescues associated with your account.
            </p>
          </div>
          <span className="badge bg-light text-secondary fw-semibold px-3 py-2">
            Total completed: {orders.length}
          </span>
        </div>

        {/* States */}
        {loading && <p>Loading orders…</p>}
        {err && !loading && <p className="text-danger">{err}</p>}

        {/* Cards */}
        {!loading && !err && (
          <div className="d-flex flex-column gap-3">
            {orders.map((o) => (
              <RescueOrderCard key={o.id} order={o} onView={onViewDetails} />
            ))}
          </div>
        )}

        {!loading && !err && orders.length === 0 && (
          <p className="text-muted text-center mt-4">
            You don’t have any completed rescues yet.
          </p>
        )}
      </div>

      {/* Modal */}
      <OrderDetailsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        order={selectedOrder}
      />
    </UserLayout>
  );
}
