import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import { getAllUsers, updateUser, deleteUser } from '../../../services/userService'; // <-- Import new service
import '../../../components/dashboards/admin/Dashboard.css';
import toast from 'react-hot-toast';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Modal States ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roles: '',
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
    // Populate all fields in the modal
    setFormData({
      name: user.name || '',
      email: user.email || '',
      roles: Array.isArray(user.roles) ? user.roles.join(', ') : '', // Convert array to string for input
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

    // Convert roles string back to an array/set
    const rolesArray = formData.roles.split(',').map(role => role.trim()).filter(Boolean);
    if (rolesArray.length === 0) {
      toast.error("Roles cannot be empty.");
      return;
    }

    // Build the full updateData object
    const updateData = {
      name: formData.name,
      email: formData.email,
      roles: rolesArray,
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
      // Display the specific backend error (e.g., "Email already in use")
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
          <td colSpan="6" style={{ textAlign: 'center' }}>Error: {error}</td>
        </tr>
      );
    }
    if (users.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: 'center' }}>No users found.</td>
        </tr>
      );
    }

    return users.map((user) => {
      // Display first role as primary, or categoryId if roles are empty
      const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : (user.categoryId || 'user');

      return (
        <tr key={user.id}>
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
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Users Management</h1>
            <p>Manage user accounts and roles</p>
          </div>
          <button className="add-user-btn">
            <i className="bi bi-plus-lg"></i> Add User
          </button>
        </header>

        <div className="search-bar">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search users..." />
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

              <div className="form-group">
                <label htmlFor="roles">Roles (comma-separated)</label>
                <input
                  type="text" id="roles" name="roles"
                  value={formData.roles} onChange={handleFormChange} required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status" name="status"
                  value={formData.status} onChange={handleFormChange} required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
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
    </div>
  );
};

export default UsersManagementPage;