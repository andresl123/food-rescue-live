import React from "react";

export default function DonorStatsCards({ stats }) {
  const cards = [
    {
      title: "Total Lots Created",
      value: stats.total ?? 0,
      icon: "bi-box",
      color: "#2563eb",
      bg: "rgba(37,99,235,0.1)",
      change: "+12%",
    },
    {
      title: "Total Lots Pending",
      value: `${stats.pending ?? 0}`,
      icon: "bi-heart",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      change: "+8%",
    },
    {
      title: "Total Lots Delivered",
      value: stats.delivered ?? 0,
      icon: "bi-people",
      color: "#16a34a",
      bg: "rgba(22,163,74,0.1)",
      change: "+23%",
    },
    {
      title: "Lots Expiring Soon",
      value: stats.expiringSoon ?? 0,
      icon: "bi-graph-up-arrow",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.1)",
      change: "+5%",
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((c, i) => (
        <div className="col-12 col-sm-6 col-lg-3" key={i}>
          <div
            className="p-4 bg-white shadow-sm rounded-4 h-100"
            style={{
              border: "1px solid #e5e7eb",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.03)";
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: c.bg,
                  color: c.color,
                }}
              >
                <i className={`bi ${c.icon}`} style={{ fontSize: "1.4rem" }}></i>
              </div>

              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "20px",
                  padding: "2px 8px",
                  backgroundColor: "#ffffff",
                  fontSize: "0.8rem",
                  color: "#111827",
                }}
              >
                <i className="bi bi-arrow-up-right me-1" style={{ fontSize: "0.75rem" }}></i>
                {c.change}
              </div>
            </div>

            <div className="mt-3">
              <p
                className="mb-1"
                style={{
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                {c.title}
              </p>
              <h3
                className=" mb-0"
                style={{
                  color: "#111827",
                  fontSize: "1.6rem",
                  letterSpacing: "-0.5px",
                }}
              >
                {c.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
