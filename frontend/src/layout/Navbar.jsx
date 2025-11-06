import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Navbar({ navbarHeight = 64, collapsed, onToggleSidebar }) {
  const [user, setUser] = useState({ name: "User", email: "", role: "" });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const d = jwtDecode(token);
        setUser({
          name: d.email?.split("@")[0] || "User",
          email: d.email || "",
          role: d.roles?.[0] || "",
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    const close = (e) => !e.target.closest(".position-relative") && setShowDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <nav
      className="navbar px-3 px-md-4 py-2 border-bottom shadow-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: `${navbarHeight}px`,
        backgroundColor: "#fff",
        zIndex: 1100,
      }}
    >
      <div className="d-flex justify-content-between align-items-center h-100 w-100">
        {/* Brand — clickable to toggle; excluded from outside-click collapse */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-pressed={collapsed}
          className="btn p-0 border-0"
          data-ignore-outside="true"   // << important
          style={{
            background: "transparent",
            cursor: "pointer",
            userSelect: "none",
            fontWeight: 800,
            fontSize: "1.35rem",
            letterSpacing: "0.2px",
            color: "#111827",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          Food Rescue Live
        </button>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-bell text-secondary" style={{ fontSize: "1.2rem", cursor: "pointer" }} />
          <div className="d-flex align-items-center">
            <span className="text-muted small me-2">Logged in as</span>
            <strong style={{ color: "#111827" }}>{user.name}</strong>
            {user.role && (
              <small className="text-secondary ms-2" style={{ fontSize: "0.85rem" }}>
                ({user.role.toUpperCase()})
              </small>
            )}
          </div>
          <div className="position-relative">
            <div
              className="d-flex justify-content-center align-items-center rounded-circle"
              style={{ width: 34, height: 34, backgroundColor: "#f3f4f6", cursor: "pointer" }}
              onClick={() => setShowDropdown((s) => !s)}
            >
              <i className="bi bi-person text-dark" style={{ fontSize: "1.2rem" }} />
            </div>
            {showDropdown && (
              <div
                className="position-absolute end-0 mt-2 shadow-sm bg-white border rounded"
                style={{ width: 160, zIndex: 1200 }}
              >
                <button
                  className="dropdown-item text-start w-100 px-3 py-2 text-secondary"
                  style={{ background: "transparent", border: "none" }}
                  onClick={() => (window.location.href = "/profile")}
                >
                  <i className="bi bi-person-circle me-2" /> Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
