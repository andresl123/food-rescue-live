import React from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import '../../../components/dashboards/admin/Dashboard.css'; // We'll add styles to this file

const LotsManagementPage = () => {
  // Dummy data for the lots table
  const lots = [
    { name: 'Downtown Warehouse', location: '123 Main St', capacity: 500, stock: 350, manager: 'Alice Johnson', status: 'active' },
    { name: 'North Storage', location: '456 North Ave', capacity: 300, stock: 300, manager: 'Bob Smith', status: 'full' },
    { name: 'East Facility', location: '789 East Rd', capacity: 400, stock: 180, manager: 'Carol White', status: 'active' },
    { name: 'West Center', location: '321 West Blvd', capacity: 250, stock: 0, manager: 'David Brown', status: 'inactive' },
  ];

  // Helper function to get badge class for status
  const getStatusBadgeClass = (status) => {
    return `badge status-${status}`;
  };

  // Helper function to calculate stock percentage for the progress bar
  const calculateStockPercentage = (stock, capacity) => {
    if (capacity === 0) return 0;
    return (stock / capacity) * 100;
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Lots Management</h1>
            <p>Manage storage lots and facilities</p>
          </div>
          <button className="add-user-btn">
            <i className="bi bi-plus-lg"></i> Add Lot
          </button>
        </header>

        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search lots..." />
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Current Stock</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, index) => (
                <tr key={index}>
                  <td>{lot.name}</td>
                  <td>{lot.location}</td>
                  <td>{lot.capacity}</td>
                  <td>
                    <div className="stock-info">
                      <span>{lot.stock}</span>
                      <div className="capacity-bar">
                        <div
                          className="capacity-bar-inner"
                          style={{ width: `${calculateStockPercentage(lot.stock, lot.capacity)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>{lot.manager}</td>
                  <td>
                    <span className={getStatusBadgeClass(lot.status)}>{lot.status}</span>
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

export default LotsManagementPage;