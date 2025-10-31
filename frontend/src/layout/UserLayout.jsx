import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar"; // if you have one

export default function Layout({ children }) {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb", // neutral white-gray background for content
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          backgroundColor: "#fff", // clean white canvas
          minHeight: "100vh",
        }}
      >
        {/* Navbar (optional) */}
        <Navbar />

        {/* Page content */}
        <main
          className="flex-grow-1"
          style={{
            backgroundColor: "#fff",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
