import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import { getAllUsers, updateUser, deleteUser } from '../../../services/userService'; // <-- Import new service
import '../../../components/dashboards/admin/Dashboard.css';
import { Status } from '../../../assets/statusValues';
import toast from 'react-hot-toast';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ADD NEW STATE FOR SEARCH
    const [searchQuery, setSearchQuery] = useState("");

  // --- Modal States ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []); // The empty array [] means this runs once when the component mounts

  // --- Badge Class Helper ---
  const getBadgeClass = (type, value) => {
    const baseClass = 'badge';
    // Use .toLowerCase() for consistency
    const formattedValue = String(value).toLowerCase();

    if (type === 'status') {
      return `${baseClass} status-${formattedValue}`;
    }
    if (type === 'role') {
      // Handle different roles
      if (formattedValue.includes('admin')) return `${baseClass} role-admin`;
      if (formattedValue.includes('donor')) return `${baseClass} role-volunteer`; // Assuming donor is volunteer
      if (formattedValue.includes('recipient')) return `${baseClass} role-recipient`;
      return `${baseClass} role-user`;
    }
    return baseClass;
  };

  // --- Edit Modal Handlers ---
  const handleOpenEditModal = (user) => {
    setCurrentUser(user);

    // This logic correctly finds the primary role
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : (user.categoryId || 'USER');

    // This logic correctly sets the 'role' (singular) state
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: primaryRole,
      status: user.status || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // The formData object now perfectly matches the DTO
    const updateData = {
      name: formData.name,
      email: formData.email,
      role: formData.role, // <-- CHANGED
      status: formData.status,
    };

    const toastId = toast.loading('Updating user...');
    try {
      const updatedUser = await updateUser(currentUser.id, updateData);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      toast.success('User updated!', { id: toastId });
      handleCloseEditModal();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  // --- Delete Modal Handlers ---
  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleHardDelete = async () => {
    if (!userToDelete || deleteConfirmText !== 'delete') return;

    const toastId = toast.loading('Deleting user...');
    try {
      await deleteUser(userToDelete.id);
      setUsers((prev) =>
        prev.filter((user) => user.id !== userToDelete.id)
      );
      toast.success('User deleted!', { id: toastId });
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  // --- 2. CREATE A FILTERED LIST ---
  // This derived state filters users based on the search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Render Table Body ---
const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <img alt="Error loading data" src="https://i.imgur.com/Q2BAa.png" />
          <td colSpan="6" style={{ textAlign: 'center' }}>Error: {error}</td>
        </tr>
      );
    }
    // Check if the initial fetch returned no users
    if (users.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center' }}>No users found.</td>
        </tr>
      );
    }
    // Check if the filter returned no users
    if (filteredUsers.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center' }}>
            No users match your search.
          </td>
        </tr>
      );
    }

    // Map over the FILTERED list
    return filteredUsers.map((user) => {
      const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : (user.categoryId || 'USER');

      const rowClass = user.status === Status.INACTIVE ? 'row-inactive' : '';

      return (
        <tr key={user.id} className={rowClass}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>
            <span className={getBadgeClass('role', primaryRole)}>{primaryRole}</span>
          </td>
          <td>
            <span className={getBadgeClass('status', user.status)}>{user.status}</span>
          </td>
          <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
          <td>
            <div className="action-icons">
              <i
                className="bi bi-pencil-fill edit-icon"
                onClick={() => handleOpenEditModal(user)}
              ></i>
              <i
                className="bi bi-trash-fill delete-icon"
                onClick={() => handleOpenDeleteModal(user)}
              ></i>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Users Management</h1>
            <p>Manage user accounts and roles</p>
          </div>
        </header>

        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
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
            <h2>Edit User</h2>
            <form onSubmit={handleEditSubmit}>

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text" id="name" name="name"
                  value={formData.name} onChange={handleFormChange} required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleFormChange} required
                />
              </div>

              {/* --- UPDATED: This is now a dropdown select --- */}
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role" name="role"
                  value={formData.role} onChange={handleFormChange} required
                >
                  <option value="DONOR">DONOR</option>
                  <option value="RECEIVER">RECEIVER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="COURIER">COURIER</option>
                  {/* Add any other primary roles you support */}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status" name="status"
                  value={formData.status} onChange={handleFormChange} required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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
            <h2>Delete User</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.5' }}>
              This will permanently delete:
              <br />
              <strong>{userToDelete?.name} ({userToDelete?.email})</strong>
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
  </>
  );
};

export default UsersManagementPage;