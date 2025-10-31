import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [user, setUser] = useState({ name: "User", email: "", role: "" });
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.email?.split("@")[0] || "User",
          email: decoded.email || "",
          role: decoded.roles?.[0] || "",
        });
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

    const handleLogout = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        await fetch("http://localhost:8080/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Refresh-Token": refreshToken || "",
          },
        });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        // ✅ Clear local storage regardless of API response
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");

        // ✅ Redirect to login
//         window.location.href = "/authentication";
      }
    };

    useEffect(() => {
      const close = (e) => {
        if (!e.target.closest(".position-relative")) setShowDropdown(false);
      };
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }, []);



  return (
    <nav
      className="navbar px-4 py-2 border-bottom shadow-sm"
      style={{
        backgroundColor: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="container-fluid d-flex justify-content-end align-items-center">
        {/* ---------- Right Section ---------- */}
        <div className="d-flex align-items-center gap-3">
          {/* Notification Icon */}
          <i
            className="bi bi-bell text-secondary"
            style={{
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          ></i>

          {/* Logged-in Info */}
          <div className="d-flex align-items-center">
            <span className="text-muted small me-2">Logged in as</span>
            <strong style={{ color: "#111827" }}>{user.name}</strong>
            {user.role && (
              <small
                className="text-secondary ms-2"
                style={{ fontSize: "0.85rem" }}
              >
                ({user.role.toUpperCase()})
              </small>
            )}
          </div>

          {/* Profile Icon */}
          {/* Profile Icon & Dropdown */}
          <div className="position-relative">
            <div
              className="d-flex justify-content-center align-items-center rounded-circle"
              style={{
                width: "34px",
                height: "34px",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
              }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <i className="bi bi-person text-dark" style={{ fontSize: "1.2rem" }}></i>
            </div>

            {showDropdown && (
              <div
                className="position-absolute end-0 mt-2 shadow-sm bg-white border rounded"
                style={{ width: "150px", zIndex: 999 }}
              >
                <button
                  className="dropdown-item text-start w-100 px-3 py-2 text-secondary"
                  onClick={handleLogout}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    width: "100%",
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
