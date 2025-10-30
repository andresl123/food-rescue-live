import React from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import '../../../components/dashboards/admin/Dashboard.css';

const FoodItemsManagementPage = () => {
  // Dummy data for the food items table
  const foodItems = [
    { name: 'Organic Apples', category: 'Fruits', quantity: '50 kg', expiry: '2025-11-15', lot: 'Downtown Warehouse', status: 'fresh' },
    { name: 'Whole Wheat Bread', category: 'Bakery', quantity: '100 loaves', expiry: '2025-11-03', lot: 'North Storage', status: 'expiring-soon' },
    { name: 'Fresh Milk', category: 'Dairy', quantity: '30 Liters', expiry: '2025-11-10', lot: 'East Facility', status: 'fresh' },
    { name: 'Canned Beans', category: 'Canned Goods', quantity: '200 cans', expiry: '2026-06-01', lot: 'Downtown Warehouse', status: 'fresh' },
    { name: 'Carrots', category: 'Vegetables', quantity: '40 kg', expiry: '2025-11-08', lot: 'East Facility', status: 'fresh' },
  ];

  // Helper function to get badge class for status
  const getStatusBadgeClass = (status) => {
    return `badge status-${status}`;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Food Items Management</h1>
            <p>Manage food inventory and stock</p>
          </div>
          <button className="add-user-btn">
            <i className="bi bi-plus-lg"></i> Add Food Item
          </button>
        </header>

        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search food items..." />
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Lot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.expiry}</td>
                  <td>{item.lot}</td>
                  <td>
                    <span className={getStatusBadgeClass(item.status)}>{item.status.replace('-', ' ')}</span>
                  </td>
                  <td>
                    <div className="action-icons">
                       <i className="bi bi-pencil-fill edit-icon"></i>
                       <i className="bi bi-trash-fill delete-icon"></i>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default FoodItemsManagementPage;