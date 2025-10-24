// src/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { mockSession } from "../mock/mockSession";

export default function Sidebar() {
  const role = mockSession.roles[0]; // "DONOR" | "RECEIVER" | "COURIER"

  const items = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    role === "DONOR"   && { path: "/donations", label: "My Donations", icon: "bi-box-seam" },
    role === "RECEIVER"&& { path: "/requests",  label: "My Requests",  icon: "bi-basket" },
    role === "COURIER" && { path: "/jobs",      label: "Delivery Jobs",icon: "bi-truck" },
    { path: "/profile", label: "Profile", icon: "bi-person" },
  ].filter(Boolean);

  return (
    <aside className="d-flex flex-column bg-secondary bg-opacity-10 border-end shadow-sm" style={{ width: 240 }}>
      <div className="p-3 border-bottom">
        <h6 className="text-uppercase text-muted mb-0">{role}</h6>
      </div>

      <nav className="flex-grow-1 mt-2">
        {items.map((it, i) => (
          <NavLink
            key={i}
            to={it.path}
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 text-decoration-none ${
                isActive ? "bg-primary text-white rounded" : "text-light"
              }`
            }
          >
            <i className={`bi ${it.icon} me-2`} />
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
