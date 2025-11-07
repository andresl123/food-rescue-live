import React, { useEffect, useState } from "react";
import { getUserProfile, logoutUser } from "../../../services/loginServices.jsx";

export default function Navbar() {
  const [user, setUser] = useState({ name: "User", email: "", role: "" });
  const [showDropdown, setShowDropdown] = useState(false);
  const navbarHeight = 64; // Define the height

  // Fetch user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getUserProfile();
        if (result.success && result.data) {
          setUser({
            name: result.data.name || result.data.email?.split("@")[0] || "User",
            role: result.data.role || result.data.roles?.[0] || "",
          });
        } else {
          console.error("Failed to fetch user info:", result.message);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".position-relative") && !e.target.closest(".navbar-brand-btn")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Handle logout
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
        zIndex: 1100, // Make sure it's on top
      }}
    >
      <div className="d-flex justify-content-between align-items-center h-100 w-100">
        {/* Brand */}
        <div
          className="navbar-brand-btn"
          style={{
            fontWeight: 800,
            fontSize: "1.35rem",
            color: "#111827",
          }}
        >
          Food Rescue Live
        </div>

        {/* Right Side Icons & Profile */}
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
                {/* Profile Button (you can enable this later)
                <button
                  className="dropdown-item text-start w-100 px-3 py-2 text-secondary"
                  style={{ background: "transparent", border: "none" }}
                  onClick={() => (window.location.href = "/profile")}
                >
                  <i className="bi bi-person-circle me-2" /> Profile
                </button>
                */}

                <button
                  className="dropdown-item text-start w-100 px-3 py-2 text-secondary"
                  style={{ background: "transparent", border: "none" }}
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}