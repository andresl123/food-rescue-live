import Sidebar from '../../../components/dashboards/admin/Sidebar';
import '../../../components/dashboards/admin/Dashboard.css';
import { getAllLots, updateLot } from '../../../services/lotService';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const LotsManagementPage = () => {
  // --- State for our data ---
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data fetching with useEffect ---
  useEffect(() => {
    // Define an async function inside useEffect to call our service
    const fetchLots = async () => {
      try {
        setIsLoading(true);
        const data = await getAllLots();
        setLots(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err.message); // Set error message
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLots(); // Call the function
  }, []); // The empty array [] means this runs once when the component mounts

  // Helper function to get badge class for status
  const getStatusBadgeClass = (status) => {
    return `badge status-${status.toLowerCase()}`;
  };

  // --- Helper to render the table body ---
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center', color: 'red' }}>
            Error: {error}
          </td>
        </tr>
      );
    }

    if (lots.length === 0) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center' }}>No lots found.</td>
        </tr>
      );
    }

    // Render the data
    return lots.map((lot) => (
      <tr key={lot.lotId}>
        <td>{lot.description}</td>
        <td>{lot.userId}</td>
        <td>{lot.totalItems}</td>
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
    ));
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
                <th>Description</th>
                <th>Donor ID</th>
                <th>Total Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            {/* Render the body using our new function */}
            <tbody>
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default LotsManagementPage;