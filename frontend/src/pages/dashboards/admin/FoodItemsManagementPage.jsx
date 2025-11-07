import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import { getAllLots } from '../../../services/lotService';
import { getAllFoodItems, updateFoodItem, deleteFoodItem } from '../../../services/foodItemService';
import '../../../components/dashboards/admin/Dashboard.css';
import toast from 'react-hot-toast';

const FoodItemsManagementPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [lotMap, setLotMap] = useState({}); // To store {lotId: lotName}
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  // --- Modal States ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    expiryDate: '',
    quantity: 0,
    unitOfMeasure: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch both items and lots at the same time
        const [itemsData, lotsData] = await Promise.all([
          getAllFoodItems(),
          getAllLots(),
        ]);

        // Create a lookup map for lot names
        const newLotMap = lotsData.reduce((map, lot) => {
          map[lot.lotId] = lot.description; // 'description' is the lot name
          return map;
        }, {});

        setFoodItems(itemsData);
        setLotMap(newLotMap);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Helper Functions ---
  const getLotName = (lotId) => {
    return lotMap[lotId] || 'Unknown Lot';
  };

  const calculateStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    const expiry = new Date(expiryDate);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 7) return 'EXPIRING_SOON';
    return 'FRESH';
  };

  const getStatusBadgeClass = (status) => {
    return `badge status-${status.toLowerCase()}`;
  };

  // --- Edit Modal Handlers ---
  const handleOpenEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      unitOfMeasure: item.unitOfMeasure,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentItem(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem) return;

    // --- START: NEW VALIDATION ---
    // Create a date object from the form's 'YYYY-MM-DD' string.
    // We split/parse it manually to avoid timezone bugs.
    const parts = formData.expiryDate.split('-');
    const expiryDate = new Date(parts[0], parts[1] - 1, parts[2]);

    // Get the start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      toast.error("Expiry date cannot be in the past. Please choose today or a future date.");
      return; // Stop the function before sending the API request
    }
    // --- END: NEW VALIDATION ---

    const toastId = toast.loading('Updating item...');
    try {
      const updatedItem = await updateFoodItem(
        currentItem.lotId,
        currentItem.itemId,
        formData
      );
      setFoodItems((prev) =>
        prev.map((item) =>
          item.itemId === updatedItem.itemId ? updatedItem : item
        )
      );
      toast.success('Item updated!', { id: toastId });
      handleCloseEditModal();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  // --- Delete Modal Handlers ---
  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleHardDelete = async () => {
    if (!itemToDelete || deleteConfirmText !== 'delete') return;

    const toastId = toast.loading('Deleting item...');
    try {
      await deleteFoodItem(itemToDelete.lotId, itemToDelete.itemId);
      setFoodItems((prev) =>
        prev.filter((item) => item.itemId !== itemToDelete.itemId)
      );
      toast.success('Item deleted!', { id: toastId });
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  // CREATE A FILTERED LIST
const filteredFoodItems = foodItems.filter(item => {
    const query = searchQuery.toLowerCase();
    const lotName = getLotName(item.lotId).toLowerCase();

    // Calculate status to make it searchable
    const status = calculateStatus(item.expiryDate).toLowerCase();
    // Replace underscore for easier searching
    const searchableStatus = status.replace('_', ' ');

    return (
      item.itemName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      lotName.includes(query) ||
      searchableStatus.includes(query) // <-- ADDED STATUS SEARCH
    );
  });

  // --- Render Table Body ---
const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>Error: {error}</td>
        </tr>
      );
    }
    // Check if initial fetch returned no items
    if (foodItems.length === 0) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>No food items found.</td>
        </tr>
      );
    }
    // Check if the filter returned no items
    if (filteredFoodItems.length === 0) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center' }}>
            No items match your search.
          </td>
        </tr>
      );
    }

    // Map over the FILTERED list
    return filteredFoodItems.map((item) => {
      const status = calculateStatus(item.expiryDate);
      const lotName = getLotName(item.lotId);

      return (
        <tr key={item.itemId}>
          <td>{item.itemName}</td>
          <td>{item.category}</td>
          <td>{item.quantity} {item.unitOfMeasure}</td>
          <td>{item.expiryDate}</td>
          <td>{lotName}</td>
          <td>
            <span className={getStatusBadgeClass(status)}>
              {status.replace('_', ' ')}
            </span>
          </td>
          <td>
            <div className="action-icons">
              <i
                className="bi bi-pencil-fill edit-icon"
                onClick={() => handleOpenEditModal(item)}
              ></i>
              <i
                className="bi bi-trash-fill delete-icon"
                onClick={() => handleOpenDeleteModal(item)}
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
            <h1>Food Items Management</h1>
            <p>Manage food inventory and stock</p>
          </div>
        </header>

        {/* SEARCH INPUT */}
        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by name, category, lot, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </main>

      {/* --- Edit Modal --- */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Food Item</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="itemName">Item Name</label>
                <input
                  type="text" id="itemName" name="itemName"
                  value={formData.itemName} onChange={handleFormChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text" id="category" name="category"
                  value={formData.category} onChange={handleFormChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date" id="expiryDate" name="expiryDate"
                  value={formData.expiryDate} onChange={handleFormChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number" id="quantity" name="quantity"
                  value={formData.quantity} onChange={handleFormChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="unitOfMeasure">Unit (e.g., kg, lbs, cans)</label>
                <input
                  type="text" id="unitOfMeasure" name="unitOfMeasure"
                  value={formData.unitOfMeasure} onChange={handleFormChange} required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEditModal}>
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

      {/* --- Delete Modal --- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Food Item</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.5' }}>
              This will permanently delete:
              <br />
              <strong>{itemToDelete?.itemName}</strong>
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
                disabled={deleteConfirmText !== 'delete'}
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

export default FoodItemsManagementPage;