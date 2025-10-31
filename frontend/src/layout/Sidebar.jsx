import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Sidebar() {
  const [role, setRole] = useState("USER");
  const [collapsed, setCollapsed] = useState(false);

  // ---------- Decode User Role ----------
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.roles?.[0] || "USER";
        setRole(userRole);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // ---------- Sidebar Items ----------
  const items = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-grid" },
    role === "DONOR" && {
      path: "/donations",
      label: "My Donations",
      icon: "bi-heart",
    },
    role === "RECEIVER" && {
      path: "/requests",
      label: "My Requests",
      icon: "bi-basket",
    },
    role === "COURIER" && {
      path: "/jobs",
      label: "Delivery Jobs",
      icon: "bi-truck",
    },
    { path: "/profile", label: "Profile", icon: "bi-person" },
  ].filter(Boolean);

  // ---------- Render ----------
  return (
    <aside
      className="d-flex flex-column border-end"
      style={{
        width: collapsed ? "84px" : "250px",
        height: "100vh",
        backgroundColor: "#fff", // ensures no dark bleed
        transition: "width 0.3s ease",
        overflow: "hidden", // hides content when collapsing
      }}
    >
      {/* ---------- Header ---------- */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom"
        style={{
          minHeight: "64px",
          backgroundColor: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 5,
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
          className="btn btn-light border-0 p-1 d-flex align-items-center justify-content-center"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            color: "#6b7280",
            fontSize: "1.1rem",
            width: "32px",
            height: "32px",
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
      <nav className="flex-grow-1 mt-3">
        {items.map((it, i) => (
          <NavLink
            key={i}
            to={it.path}
            end
            className={({ isActive }) =>
              `d-flex align-items-center text-decoration-none mb-2 mx-3 ${
                isActive ? "text-white" : "text-secondary"
              }`
            }
            style={({ isActive }) => ({
              height: "48px",
              borderRadius: "10px", // subtle rectangular corners
              transition: "all 0.25s ease",
              padding: collapsed ? "0 12px" : "0 18px",
              justifyContent: collapsed ? "center" : "flex-start",
              fontWeight: isActive ? "600" : "500",
              backgroundColor: isActive ? "#111827" : "transparent",
            })}
          >
            <i
              className={`bi ${it.icon}`}
              style={{
                fontSize: "1.2rem",
                marginRight: collapsed ? "0" : "12px",
              }}
            ></i>
            {!collapsed && (
              <span
                className="fw-medium"
                style={{
                  fontSize: "0.95rem",
                  color: "inherit",
                }}
              >
                {it.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
