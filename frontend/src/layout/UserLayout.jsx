// src/layout/UserLayout.jsx
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function UserLayout({ children }) {
  return (
    <div className="d-flex bg-dark text-light min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />
        <main className="p-4 flex-grow-1">{children}</main>
      </div>
    </div>
  );
}
