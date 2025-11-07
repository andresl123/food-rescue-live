import React from 'react';
import { NavLink } from 'react-router-dom';
import './Dashboard.css';

const Sidebar = () => {
  const navItems = [
    { path: "/admin-dashboard", icon: "bi-grid-1x2-fill", label: "Overview" },
    { path: "/admin-users", icon: "bi-people-fill", label: "Users" },
    { path: "/admin-lots", icon: "bi-box-seam-fill", label: "Lots" },
    { path: "/admin-food-items", icon: "bi-egg-fried", label: "Food Items" },
    { path: "/admin-orders", icon: "bi-cart-check-fill", label: "Orders & POD" },
  ];

  return (
    <aside className="sidebar">
      {/* The header is now removed from here */}
      <nav className="sidebar-nav" style={{ marginTop: '20px' }}> {/* Added margin-top */}
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive && item.path !== "#") ? 'active' : ''}
              >
                <i className={`bi ${item.icon}`}></i> {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;