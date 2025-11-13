import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getUserProfile, logoutUser } from "../services/loginServices";

export default function Sidebar({
  collapsed,
  setCollapsed,
  navbarHeight = 64,
  expandedWidth = 260,
  collapsedWidth = 88,
  sidebarRef,
}) {
  const [role, setRole] = useState("USER");

useEffect(() => {
  const fetchUserRole = async () => {
    try {
      const result = await getUserProfile();
      if (result.success && result.data?.role) {
        setRole((result.data.role || "USER").toUpperCase());
      } else {
        console.error("Failed to fetch user role");
        setRole("USER");
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      setRole("USER");
    }
  };

  fetchUserRole();
}, []);

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       try {
//         const d = jwtDecode(token);
//         setRole((d.roles?.[0] || "USER").toUpperCase());
//       } catch {}
//     }
//   }, []);

  /** ---------------- Role → Nav items map ---------------- */
  const baseItems = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-grid" },
  ];

  const roleNavMap = {
    COURIER: [
      { path: "/orders", label: "Previous Orders", icon: "bi-clock-history" },
      { path: "/profile", label: "Profile", icon: "bi-person" },
    ],
    RECEIVER: [
      { path: "/profile", label: "Profile", icon: "bi-person" },
      { path: "/orders", label: "Previous Orders", icon: "bi-clock-history" },
    ],
    DONOR: [
      { path: "/profile", label: "Profile", icon: "bi-person" },
      { path: "/food-items", label: "My Food Items", icon: "bi-box-seam" },
      { path: "/bulk-import", label: "Bulk Import", icon: "bi-cloud-upload" },
    ],
    DEFAULT: [
      { path: "/profile", label: "Profile", icon: "bi-person" },
    ],
  };

  const items = [
    ...baseItems,
    ...(roleNavMap[role] ?? roleNavMap.DEFAULT),
  ];

const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        window.location.href = "/authentication"; // redirect to login
      } else {
        console.error("Logout failed:", result.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

//   const handleLogout = async () => {
//     const accessToken = localStorage.getItem("accessToken");
//     const refreshToken = localStorage.getItem("refreshToken");
//     try {
//       await fetch("http://localhost:8080/api/v1/auth/logout", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//           "X-Refresh-Token": refreshToken || "",
//         },
//       });
//     } catch {}
//     // localStorage.removeItem("accessToken");
//     // localStorage.removeItem("refreshToken");
//     // window.location.href = "/authentication";
//   };

  // Expand sidebar on any click inside it while collapsed.
  const handleRootMouseDown = (e) => {
    if (!collapsed) return;
    if (e.target.closest('[data-action="logout"]')) return;
    setCollapsed(false);
    if (e.target.closest("a, button")) e.preventDefault();
    e.stopPropagation();
  };

  return (
    <aside
      ref={sidebarRef}
      onMouseDown={handleRootMouseDown}
      aria-expanded={!collapsed}
      title={collapsed ? "Expand sidebar" : undefined}
      style={{
        position: "fixed",
        top: "var(--navbar-h)",
        left: 0,
        height: `calc(100vh - var(--navbar-h))`,
        width: collapsed ? `${collapsedWidth}px` : `${expandedWidth}px`,
        backgroundColor: "#fff",
        borderRight: "1px solid rgba(0,0,0,.1)",
        transition: "width 0.25s ease",
        zIndex: 1050,
        cursor: collapsed ? "pointer" : "default",
        userSelect: "none",
      }}
      className="d-flex flex-column"
    >
      <nav className="flex-grow-1 py-3">
        {items.map((it, i) => (
          <NavLink
            key={i}
            to={it.path}
            end
            tabIndex={collapsed ? -1 : 0}
            className={({ isActive }) =>
              `d-flex align-items-center text-decoration-none mb-2 ${
                isActive ? "text-white" : "text-secondary"
              }`
            }
            style={({ isActive }) => ({
              height: 48,
              borderRadius: 10,
              transition: "all 0.25s ease",
              padding: collapsed ? "0 12px" : "0 18px",
              margin: "0 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              fontWeight: isActive ? 600 : 500,
              backgroundColor: isActive ? "#111827" : "transparent",
              pointerEvents: collapsed ? "none" : "auto",
            })}
          >
            <i
              className={`bi ${it.icon}`}
              style={{ fontSize: "1.2rem", marginRight: collapsed ? 0 : 12 }}
            />
            {!collapsed && (
              <span className="fw-medium" style={{ fontSize: "0.95rem" }}>
                {it.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-top p-2 d-flex justify-content-center">
        <button
          className="btn btn-link text-danger d-flex align-items-center gap-2 px-2"
          data-action="logout"
          onClick={handleLogout}
          style={{ textDecoration: "none", fontWeight: 600 }}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
