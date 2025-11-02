// src/layout/UserLayout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FoodItems from "../components/dashboards/donor/FoodItemList";

export default function UserLayout({ role, children }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />


      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <main
          className="flex-grow-1"
          style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}
        >
          {activeTab === "dashboard" && children}
          {activeTab === "foodItems" && role === "DONOR" && <FoodItems />}
        </main>
      </div>
    </div>
  );
}
