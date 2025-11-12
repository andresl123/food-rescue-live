import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Dashboard.css'; // Your existing dashboard styles

const AdminLayout = () => {
  const navbarHeight = 64; // Must match the height in Navbar.jsx

  return (
    <>
      <Navbar /> {/* The new top navbar */}
      <div
        className="dashboard-container"
        style={{ marginTop: `${navbarHeight}px` }} // Offset content by navbar height
      >
        <Sidebar />
        <Outlet /> {/* This is where your page (Users, Lots, etc.) will render */}
      </div>
    </>
  );
};

export default AdminLayout;