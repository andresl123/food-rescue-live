import React from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import StatCard from '../../../components/dashboards/admin/StatCard';
import '../../../components/dashboards/admin/Dashboard.css';

const AdminDashboard = () => {
  const quickStats = [
    { label: 'Orders Fulfilled', value: 87, color: 'bg-success' },
    { label: 'Food Items in Stock', value: 64, color: 'bg-primary' },
    { label: 'Active Users', value: 92, color: 'bg-purple' },
  ];

  const recentActivity = [
    { title: 'New order', detail: 'Order #1234 placed', time: '2 mins ago' },
    { title: 'User registered', detail: 'john@example.com joined', time: '15 mins ago' },
    { title: 'Lot updated', detail: 'Lot #69 inventory updated', time: '1 hour ago' },
    { title: 'Food item added', detail: 'Organic Apples added', time: '2 hours ago' },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <h1>Dashboard Overview</h1>
          <p>Monitor your food rescue operations</p>
        </header>

        <div className="stat-cards-grid">
          <StatCard icon="bi-people" title="Total Users" value="1,234" iconBgColor="#e7f0ff" />
          <StatCard icon="bi-box" title="Active Lots" value="89" iconBgColor="#f2e7ff" />
          <StatCard icon="bi-apple" title="Food Items" value="456" iconBgColor="#e7fff2" />
          <StatCard icon="bi-cart" title="Orders Today" value="127" iconBgColor="#fff4e7" />
        </div>

        <div className="data-grid">
          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="card-body">
              <ul className="activity-list">
                {recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="activity-details">
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Quick Stats</h3>
            </div>
            <div className="card-body">
              {quickStats.map((stat, index) => (
                <div className="stat-item" key={index}>
                  <div className="stat-info">
                    <span>{stat.label}</span>
                    <span>{stat.value}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${stat.color}`}
                      role="progressbar"
                      style={{ width: `${stat.value}%` }}
                      aria-valuenow={stat.value}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;