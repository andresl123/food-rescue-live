// src/components/dashboards/donor/DonorStatsCards.jsx
import React from "react";

export default function DonorStatsCards({ stats }) {
  const cards = [
    { title: "Total Donations", value: stats.total,     color: "primary", icon: "bi-gift" },
    { title: "Pending",         value: stats.pending,   color: "warning", icon: "bi-hourglass-split" },
    { title: "Picked Up",       value: stats.pickedUp,  color: "info",    icon: "bi-truck" },
    { title: "Delivered",       value: stats.delivered, color: "success", icon: "bi-check-circle" },
  ];

  return (
    <div className="row g-3">
      {cards.map((c, i) => (
        <div className="col-12 col-sm-6 col-lg-3" key={i}>
          <div className={`card text-bg-${c.color} shadow-sm`}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">{c.title}</h6>
                <h3 className="fw-bold mb-0">{c.value ?? 0}</h3>
              </div>
              <i className={`bi ${c.icon} fs-1 opacity-75`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
