// pages/RescueOrdersPage.jsx
import React, { useMemo, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import RescueOrderCard from "../../components/orders/RescueOrderCard";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RescueOrdersPage({ data }) {
  // data shape:
  // { current:[order...], completed:[order...] }
  const [tab, setTab] = useState("completed"); // default like screenshot

  const { currentCount, completedCount, list } = useMemo(() => {
    const current = data?.current ?? [];
    const completed = data?.completed ?? [];
    return {
      currentCount: current.length,
      completedCount: completed.length,
      list: tab === "current" ? current : completed
    };
  }, [data, tab]);

  const onViewDetails = (order) => {
    // hook up your modal/route here
    console.log("view", order.id);
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

        {/* Cards */}
        {list.map((o) => (
          <RescueOrderCard key={o.id} order={o} onView={onViewDetails} />
        ))}
      </div>
    </UserLayout>
  );
}
