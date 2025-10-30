import React from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import '../../../components/dashboards/admin/Dashboard.css'; // We'll add styles to this file

const UsersManagementPage = () => {
  // Dummy data to populate the table
  const users = [
    { name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'active', joinedDate: '2024-01-15' },
    { name: 'Bob Smith', email: 'bob@example.com', role: 'volunteer', status: 'active', joinedDate: '2024-02-20' },
    { name: 'Carol White', email: 'carol@example.com', role: 'recipient', status: 'active', joinedDate: '2024-03-10' },
    { name: 'David Brown', email: 'david@example.com', role: 'volunteer', status: 'inactive', joinedDate: '2024-01-05' },
  ];

  // Helper function to get badge classes
  const getBadgeClass = (type, value) => {
    const baseClass = 'badge';
    if (type === 'status') {
      return `${baseClass} status-${value}`;
    }
    if (type === 'role') {
        return `${baseClass} role-${value}`;
    }
    return baseClass;
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
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={getBadgeClass('role', user.role)}>{user.role}</span>
                  </td>
                  <td>
                    <span className={getBadgeClass('status', user.status)}>{user.status}</span>
                  </td>
                  <td>{user.joinedDate}</td>
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

export default UsersManagementPage;