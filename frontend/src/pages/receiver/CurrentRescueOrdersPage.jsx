import React, { useEffect, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import DeliveryUpdateCard from "../../components/orders/DeliveryUpdateCard";
import "bootstrap/dist/css/bootstrap.min.css";

const BFF_BASE_URL = import.meta.env.VITE_BFF_BASE_URL;

export default function CurrentRescueOrdersPage() {
  const [orders, setOrders] = useState([]); // only current orders
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setErr("");
      try {
        // ⬅️ same endpoint as other page
        const res = await fetch(`${BFF_BASE_URL}/api/ui/orders`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const msg = await res.text();
          setErr(msg || "Failed to load current orders");
          setLoading(false);
          return;
        }

        const json = await res.json();
        // only current / active rescues
        setOrders(json.current || []);
      } catch (e) {
        console.error("current orders fetch error", e);
        setErr("Network error fetching current orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <UserLayout>
      <div className="container py-4">
        <style>{`
          .current-rescue-title {
            font-weight: 700;
            letter-spacing: 0.02em;
          }
          .current-rescue-subtitle {
            max-width: 520px;
          }
        `}</style>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
          <div>
            <h2 className="current-rescue-title mb-1">Current Deliveries</h2>
            <p className="text-muted current-rescue-subtitle mb-0">
              Track your in-progress food rescues and see live delivery OTPs.
            </p>
          </div>
          <span className="badge bg-light text-secondary fw-semibold px-3 py-2">
            Active rescues: {orders.length}
          </span>
        </div>

        {/* States */}
        {loading && <p>Loading current orders…</p>}
        {err && !loading && <p className="text-danger">{err}</p>}

        {/* Cards */}
        {!loading && !err && (
          <div className="d-flex flex-column gap-3">
            {orders.map((o) => (
              <DeliveryUpdateCard key={o.id} order={o} />
            ))}
          </div>
        )}

        {!loading && !err && orders.length === 0 && (
          <p className="text-muted text-center mt-4">
            You don’t have any active rescues right now.
          </p>
        )}
      </div>
    </UserLayout>
  );
}
