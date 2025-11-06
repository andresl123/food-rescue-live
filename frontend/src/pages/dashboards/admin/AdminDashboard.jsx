import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/dashboards/admin/Sidebar';
import StatCard from '../../../components/dashboards/admin/StatCard';
import '../../../components/dashboards/admin/Dashboard.css';

// --- 1. Import all the services we need ---
import { getAllLots } from '../../../services/lotService';
import { getAllFoodItems } from '../../../services/foodItemService';
import { getAllUsers } from '../../../services/userService';

const AdminDashboard = () => {
  // --- 2. Add state for our dynamic data ---
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLots: 0,
    foodItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 3. Fetch all data when the component mounts ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel for efficiency
        const [usersData, lotsData, itemsData] = await Promise.all([
          getAllUsers(),
          getAllLots(),
          getAllFoodItems(),
        ]);

// --- 4. Calculate the stats ---
        const totalUsers = usersData.length;
        // FIX: Check for both "OPEN" and "ACTIVE"
        const activeLots = lotsData.filter(lot =>
          lot.status === 'OPEN' || lot.status === 'ACTIVE'
        ).length;
        const foodItems = itemsData.length;

        setStats({
          totalUsers: totalUsers,
          activeLots: activeLots,
          foodItems: foodItems,
        });

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty array means this runs once on mount


  // (These are still dummy data, as we don't have the backend for them yet)
  const quickStats = [
    { label: 'Orders Fulfilled', value: 87, color: 'bg-success' },
    { label: 'Food Items in Stock', value: 64, color: 'bg-primary' },
    { label: 'Active Users', value: 92, color: 'bg-purple' },
  ];
  const recentActivity = [
    { title: 'New order', detail: 'Order #1234 placed', time: '2 mins ago' },
    { title: 'User registered', detail: 'john@example.com joined', time: '15 mins ago' },
  ];

  const loadingValue = '...';

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <h1>Dashboard Overview</h1>
          <p>Monitor your food rescue operations</p>
        </header>

        {/* Display an error message if fetching failed */}
        {error && (
          <div className="alert alert-danger" role="alert">
            Could not load dashboard data: {error}
          </div>
        )}

        <div className="stat-cards-grid">
          {/* --- 5. Hook up the dynamic data to the StatCards --- */}
          <StatCard
            icon="bi-people"
            title="Total Users"
            value={isLoading ? loadingValue : stats.totalUsers}
            iconBgColor="#e7f0ff"
          />
          <StatCard
            icon="bi-box"
            title="Active Lots"
            value={isLoading ? loadingValue : stats.activeLots}
            iconBgColor="#f2e7ff"
          />
          <StatCard
            icon="bi-apple"
            title="Food Items"
            value={isLoading ? loadingValue : stats.foodItems}
            iconBgColor="#e7fff2"
          />
          <StatCard
            icon="bi-cart"
            title="Orders Today"
            value={127} // This is still static
            iconBgColor="#fff4e7"
          />
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
                    {/* ... (static data) ... */}
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
                  {/* ... (static data) ... */}
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