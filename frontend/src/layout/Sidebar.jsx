// src/layout/Sidebar.jsx
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Sidebar({ activeTab, setActiveTab, role }) {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { key: "dashboard", label: "Dashboard", icon: "bi-grid" },
    ...(role === "DONOR"
      ? [{ key: "foodItems", label: "Food Items", icon: "bi-egg-fried" }]
      : []),
    { key: "profile", label: "Profile", icon: "bi-person" },
  ];

  return (
    <aside
      className="d-flex flex-column border-end"
      style={{
        width: collapsed ? "84px" : "250px",
        height: "100vh",
        backgroundColor: "#ffffff",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* ---------- Header ---------- */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom"
        style={{
          backgroundColor: "#fff",
        }}
      >
        {!collapsed && (
          <h5
            className="fw-bold mb-0"
            style={{ color: "#111827", fontSize: "1.1rem" }}
          >
            Food Rescue Live
          </h5>
        )}
        <button
          className="btn btn-light border-0 p-1"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            color: "#6b7280",
          }}
        >
          <i
            className={`bi ${
              collapsed ? "bi-chevron-right" : "bi-chevron-left"
            }`}
          ></i>
        </button>
      </div>

      {/* ---------- Navigation ---------- */}
      <nav className="flex-grow-1 mt-3 px-3">
        {items.map((it) => {
          const isActive = activeTab === it.key;
          return (
            <button
              key={it.key}
              onClick={() => setActiveTab(it.key)}
              className="d-flex align-items-center border-0"
              style={{
                width: "100%",
                height: "46px",
                marginBottom: "6px",
                borderRadius: "10px",
                backgroundColor: isActive ? "#111827" : "transparent",
                color: isActive ? "#ffffff" : "#6b7280",
                fontWeight: isActive ? 600 : 500,
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background-color 0.2s ease, color 0.2s ease",
                cursor: "pointer",
                padding: collapsed ? "0" : "0 16px",
                boxSizing: "border-box",
              }}
            >
              <i
                className={`bi ${it.icon}`}
                style={{
                  fontSize: "1.15rem",
                  marginRight: collapsed ? 0 : 12,
                  color: "inherit",
                }}
              />
              {!collapsed && (
                <span
                  style={{
                    fontSize: "0.95rem",
                    color: "inherit",
                  }}
                >
                  {it.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
