import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
// Import all three functions
import { getAllLots, updateLot, deleteLot } from '../../../services/lotService';
import '../../../components/dashboards/admin/Dashboard.css';
import toast from 'react-hot-toast';

const LotsManagementPage = () => {
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for Edit Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLot, setCurrentLot] = useState(null);
  const [formData, setFormData] = useState({ description: '', status: '' });

  // --- State for Delete Modal ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState(""); // State for confirmation text

  // --- Data fetching ---
  useEffect(() => {
    const fetchLots = async () => {
      try {
        setIsLoading(true);
        const data = await getAllLots();
        setLots(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLots();
  }, []);

  // --- Edit Modal Handlers ---
  const handleOpenModal = (lot) => {
    setCurrentLot(lot);
    setFormData({ description: lot.description, status: lot.status });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLot(null);
    setFormData({ description: '', status: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentLot) return;
    const toastId = toast.loading('Updating lot...');
    try {
      const updatedLot = await updateLot(currentLot.lotId, formData);
      setLots((prevLots) =>
        prevLots.map((lot) =>
          lot.lotId === updatedLot.lotId ? updatedLot : lot
        )
      );
      toast.success('Lot updated successfully!', { id: toastId });
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  // --- Delete Modal Handlers ---
  const handleOpenDeleteModal = (lot) => {
    setLotToDelete(lot);
    setDeleteConfirmText(""); // Reset confirmation text
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setLotToDelete(null);
    setDeleteConfirmText(""); // Reset confirmation text
    setIsDeleteModalOpen(false);
  };

  // Hard Delete Handler
  const handleHardDelete = async () => {
    if (!lotToDelete || deleteConfirmText !== 'delete') return;

    const toastId = toast.loading('Deleting lot permanently...');
    try {
      await deleteLot(lotToDelete.lotId);
      setLots((prevLots) =>
        prevLots.filter((lot) => lot.lotId !== lotToDelete.lotId)
      );
      toast.success('Lot deleted permanently!', { id: toastId });
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

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
    return lots.map((lot) => {
      // **UPDATED:** Only apply class if CLOSED or INACTIVE
      const rowClass =
        lot.status === 'CLOSED' || lot.status === 'INACTIVE'
          ? 'lot-unavailable'
          : '';

      return (
        <tr key={lot.lotId} className={rowClass}>
          <td>{lot.description}</td>
          <td>{lot.userId}</td>
          <td>{lot.totalItems}</td>
          <td>
            <span className={getStatusBadgeClass(lot.status)}>{lot.status}</span>
          </td>
          <td>
            <div className="action-icons">
              <i
                className="bi bi-pencil-fill edit-icon"
                onClick={() => handleOpenModal(lot)}
              ></i>
              <i
                className="bi bi-trash-fill delete-icon"
                onClick={() => handleOpenDeleteModal(lot)}
              ></i>
            </div>
          </td>
        </tr>
      );
    });
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
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </main>

      {/* --- The Update Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Lot</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="EMPTY">EMPTY</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
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

      {/* --- Delete Confirmation Modal (UPDATED) --- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Lot Permanently</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.5' }}>
              This action cannot be undone. This will permanently delete the lot:
              <br />
              <strong>{lotToDelete?.description}</strong>
            </p>
            <div className="form-group">
              <label htmlFor="deleteConfirm">
                To confirm, please type "<strong>delete</strong>"
              </label>
              <input
                type="text"
                id="deleteConfirm"
                name="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-hard-delete"
                onClick={handleHardDelete}
                disabled={deleteConfirmText !== 'delete'} // Button is disabled until user types "delete"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotsManagementPage;