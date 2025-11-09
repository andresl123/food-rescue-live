import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/dashboards/admin/StatCard';
import '../../../components/dashboards/admin/Dashboard.css';

import { getAllLots } from '../../../services/lotService';
import { getAllFoodItems, getExpiringSoonItems } from '../../../services/foodItemService';
import { getAllUsers } from '../../../services/userService';
import { Status } from '../../../assets/statusValues';

const AdminDashboard = () => {
  // --- 2. Add state for our dynamic data ---
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLots: 0,
    foodItems: 0,
  });
  const [expiringItems, setExpiringItems] = useState([]);
  const [lotMap, setLotMap] = useState({}); // For lot names
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data when the component mounts ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel for efficiency
    const [usersData, lotsData, itemsData, expiringData] = await Promise.all([
          getAllUsers(),
          getAllLots(),
          getAllFoodItems(),
          getExpiringSoonItems(), // <-- New API call
        ]);
        // CREATE LOT MAP ---
        // this to show lot names in the list
        const newLotMap = lotsData.reduce((map, lot) => {
          map[lot.lotId] = lot.description; // 'description' is the lot name
          return map;
        }, {});
        setLotMap(newLotMap);

        // CALCULATE STATS
        const totalUsers = usersData.length;
        const activeLots = lotsData.filter(lot => lot.status === Status.ACTIVE).length;
        const foodItems = itemsData.length;

        setStats({ totalUsers, activeLots, foodItems });
        setExpiringItems(expiringData); // <-- Set the new state

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // HELPER FUNCTIONS
  const getLotName = (lotId) => {
    return lotMap[lotId] || 'Unknown Lot';
  };

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days === 0) return "Expires today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const loadingValue = '...';

  // (These are still dummy data, as we don't have the backend for them yet)
  const quickStats = [
    { label: 'Orders Fulfilled', value: 87, color: 'bg-success' },
    { label: 'Food Items in Stock', value: 64, color: 'bg-primary' },
    { label: 'Active Users', value: 92, color: 'bg-purple' },
  ];

  return (
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
              <h3>Items Nearing Expiry</h3>
            </div>
            <div className="card-body">
              <ul className="activity-list">
                {isLoading ? (
                  <li>Loading...</li>
                ) : error ? (
                  <li>Error loading items.</li>
                ) : expiringItems.length === 0 ? (
                  <li>No items are expiring soon.</li>
                ) : (
                  expiringItems.map(item => (
                    <li key={item.itemId}>
                      <div className="activity-details">
                        <strong>{item.itemName}</strong>
                        <span>Lot: {getLotName(item.lotId)}</span>
                      </div>
                      <span className="activity-time expiring-soon-text">
                        {getDaysLeft(item.expiryDate)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* --- "QUICK STATS" CARD (Now for "Recent Orders") --- */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Orders</h3>
            </div>
            <div className="card-body">
              {/* We'll build this out next */}
              <p>Recent orders will be displayed here.</p>

              {/* (Old quick stats code removed) */}
            </div>
          </div>
        </div>
      </main>
  );
};

export default AdminDashboard;