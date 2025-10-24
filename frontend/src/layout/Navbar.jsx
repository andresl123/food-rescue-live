// src/layout/Navbar.jsx
import React from "react";
import { mockSession } from "../mock/mockSession";

export default function Navbar() {
  return (
    <nav className="navbar navbar-dark bg-secondary bg-opacity-25 px-4 py-2 shadow-sm">
      <div className="d-flex justify-content-between w-100 align-items-center">
        <h5 className="mb-0 fw-bold text-light">Food Rescue Live</h5>
        <div className="d-flex align-items-center">
          <span className="text-secondary me-2">Logged in as</span>
          <strong className="text-light">{mockSession.name}</strong>
          <div className="ms-3">
            <i className="bi bi-person-circle fs-4 text-light"></i>
          </div>
        </div>
      </div>
    </nav>
  );
}
