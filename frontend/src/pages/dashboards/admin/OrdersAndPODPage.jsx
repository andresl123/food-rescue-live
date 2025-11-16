import React, { useState, useEffect } from 'react';
// --- MAKE SURE ALL 4 OF THESE IMPORTS ARE CORRECT ---
import { getAdminOrderView, updateJobStatus } from '../../../services/jobService';
import { Status } from '../../../assets/statusValues';
import '../../../components/dashboards/admin/Dashboard.css';
import toast from 'react-hot-toast'; // <-- THIS IS LIKELY THE MISSING IMPORT

const OrdersAndPODPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // --- 2. Removed Delete Modal State ---

  // --- Data Fetching ---
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

  // --- Helper for status badges ---
  const getStatusBadgeClass = (status) => {
    let mappedStatus = Status.PENDING; // Default
    if (status === "DELIVERED" || status === "COMPLETED") mappedStatus = Status.DELIVERED;
    if (status === "CANCELLED" || status === "FAILED" || status === "RETURNED") mappedStatus = Status.INACTIVE;
    if (status === "ASSIGNED" || status === "PICKED_UP" || status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") mappedStatus = Status.ACTIVE;

    return `badge status-${mappedStatus.toLowerCase()}`;
  };

  // --- Filter logic ---
  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      (order.orderId && order.orderId.toLowerCase().includes(query)) ||
      (order.recipientName && order.recipientName.toLowerCase().includes(query)) ||
      (order.status && order.status.toLowerCase().includes(query))
    );
  });

  // --- Modal Handlers ---
  const handleOpenModal = (order) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrder(null);
    setNewStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrder || !newStatus) return;

    const toastId = toast.loading('Updating status...');
    try {
      const apiResponse = await updateJobStatus(currentOrder.jobId, newStatus);

      if (apiResponse.success) {
        const updatedJob = apiResponse.data;

        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.jobId === updatedJob.jobId
            ? {
                ...order,
                status: updatedJob.status,
                deliveryDate: updatedJob.completedAt
              }
            : order
          )
        );

        toast.success('Status updated!', { id: toastId });
        handleCloseModal();
      } else {
        throw new Error(apiResponse.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: toastId });
      console.error(err);
    }
  };

  // --- 3. Removed Delete Modal Handlers ---

  // --- Render Table Body ---
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
      const isInactive = order.status === "CANCELLED" || order.status === "FAILED" || order.status === "RETURNED";
      const rowClass = isInactive ? 'row-inactive' : '';

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
            {/* 4. Removed trash can icon */}
            <div className="action-icons">
              <i
                className="bi bi-pencil-fill edit-icon"
                onClick={() => handleOpenModal(order)}
              ></i>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <> {/* Fragment wrapper */}

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
      </main> {/* End of main content */}

      {/* --- Edit Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Job Status</h2>
            <p style={{ margin: '16px 0' }}>
              Order ID: <strong>{currentOrder.orderId.substring(0, 8)}...</strong>
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="status">Job Status</label>
                <select
                  id="status"
                  name="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="UNASSIGNED">UNASSIGNED</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Removed Delete Modal JSX */}

    </>
  );
};

export default OrdersAndPODPage;