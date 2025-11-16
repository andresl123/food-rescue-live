import React, { useState, useEffect } from 'react';
import { getAdminOrderView } from '../../../services/jobService';
import { Status } from '../../../assets/statusValues';
import '../../../components/dashboards/admin/Dashboard.css';

const OrdersAndPODPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminOrderView();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Helper for status badges
  const getStatusBadgeClass = (status) => {
    // Map job statuses to your standard statuses
    let mappedStatus = Status.PENDING; // Default
    if (status === "DELIVERED" || status === "COMPLETED") mappedStatus = Status.DELIVERED;
    if (status === "CANCELLED" || status === "FAILED" || status === "RETURNED") mappedStatus = Status.INACTIVE;
    if (status === "ASSIGNED" || status === "PICKED_UP" || status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") mappedStatus = Status.ACTIVE;

    return `badge status-${mappedStatus.toLowerCase()}`;
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.recipientName.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  // Render logic
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan="8" style={{ textAlign: 'center', color: 'red' }}>
            Error: {error}
          </td>
        </tr>
      );
    }
    if (filteredOrders.length === 0) {
      return (
        <tr>
          <td colSpan="8" style={{ textAlign: 'center' }}>
            {orders.length === 0 ? "No orders found." : "No orders match your search."}
          </td>
        </tr>
      );
    }

    return filteredOrders.map((order) => {
      const isInactive = order.status === "CANCELLED" || order.status === "FAILED";
      const rowClass = isInactive ? 'row-inactive' : ''; // Apply strikethrough

      return (
        <tr key={order.orderId} className={rowClass}>
          <td>{order.orderId.substring(0, 8)}...</td>
          <td>{order.recipientName}</td>
          <td>{order.items}</td>
          <td className="otp-code">{order.pickupCode}</td>
          <td className="otp-code">{order.deliveryCode}</td>
          <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</td>
          <td>
            <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
          </td>
          <td>
            <div className="action-icons">
              {/* We can wire these up next */}
              <i className="bi bi-pencil-fill edit-icon"></i>
              <i className="bi bi-trash-fill delete-icon"></i>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <main className="main-content">
      <header className="page-header">
        <div>
          <h1>Orders & Proof of Delivery (POD)</h1>
          <p>Manage orders, deliveries and OTP verification</p>
        </div>
      </header>

      <div className="search-bar">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Search by Order ID, Recipient, or Status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Recipient</th>
              <th>Items</th>
              <th>Pickup OTP</th>
              <th>Delivery OTP</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>
    </main>
  );
};

export default OrdersAndPODPage;