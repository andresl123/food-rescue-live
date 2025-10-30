import React from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import '../../../components/dashboards/admin/Dashboard.css';

const OrdersAndPODPage = () => {
  // Dummy data for the orders table
  const orders = [
    { orderNumber: 'ORD-1001', recipient: 'Carol White', items: 'Organic Apples, Carrots', pickupOTP: '123456', deliveryOTP: '789812', date: '2025-10-29', status: 'completed' },
    { orderNumber: 'ORD-1002', recipient: 'David Brown', items: 'Whole Wheat Bread, Milk', pickupOTP: '345678', deliveryOTP: '981234', date: '2025-10-30', status: 'processing' },
    { orderNumber: 'ORD-1003', recipient: 'Emma Davis', items: 'Canned Beans', pickupOTP: '567890', deliveryOTP: '123456', date: '2025-10-31', status: 'pending' },
    { orderNumber: 'ORD-1004', recipient: 'Frank Wilson', items: 'Fresh Milk, Carrots', pickupOTP: '678901', deliveryOTP: '234561', date: '2025-10-28', status: 'completed' },
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
            <h1>Orders & Proof of Delivery (POD)</h1>
            <p>Manage orders, deliveries and OTP verification</p>
          </div>
          <button className="add-user-btn">
            <i className="bi bi-plus-lg"></i> Add Order
          </button>
        </header>

        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search orders..." />
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
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.orderNumber}</td>
                  <td>{order.recipient}</td>
                  <td>{order.items}</td>
                  <td className="otp-code">{order.pickupOTP}</td>
                  <td className="otp-code">{order.deliveryOTP}</td>
                  <td>{order.date}</td>
                  <td>
                    <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
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

export default OrdersAndPODPage;