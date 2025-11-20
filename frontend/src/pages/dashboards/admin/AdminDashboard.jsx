import React, { useState, useEffect } from 'react';
import UserLayout from '../../../layout/UserLayout'; // <-- Used here
import StatCard from '../../../components/dashboards/admin/StatCard';
import '../../../components/dashboards/admin/Dashboard.css';

import { getAllLots } from '../../../services/lotService';
import { getAllFoodItems, getExpiringSoonItems } from '../../../services/foodItemService';
import { getAllUsers } from '../../../services/userService';
import { getRecentOrders, getOrdersTodayCount } from '../../../services/jobService';
import { Status } from '../../../assets/statusValues';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLots: 0,
    foodItems: 0,
    ordersToday: 0,
  });
  const [expiringItems, setExpiringItems] = useState([]);
  const [lotMap, setLotMap] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [usersData, lotsData, itemsData, expiringData, ordersData, ordersTodayData] = await Promise.all([
          getAllUsers(),
          getAllLots(),
          getAllFoodItems(),
          getExpiringSoonItems(),
          getRecentOrders(),
          getOrdersTodayCount(),
        ]);

        const newLotMap = lotsData.reduce((map, lot) => {
          map[lot.lotId] = lot.description;
          return map;
        }, {});
        setLotMap(newLotMap);

        const totalUsers = usersData.length;
        const activeLots = lotsData.filter(lot => lot.status === Status.ACTIVE).length;
        const foodItems = itemsData.length;

        setStats({ totalUsers, activeLots, foodItems, ordersToday: ordersTodayData });
        setExpiringItems(expiringData);
        setRecentOrders(ordersData);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const getOrderStatusBadge = (status) => {
    let statusClass = "status-pending";
    if (status === Status.DELIVERED) statusClass = "status-delivered";
    if (status === Status.ACTIVE) statusClass = "status-active";
    if (status === Status.INACTIVE) statusClass = "status-inactive";

    return <span className={`badge ${statusClass}`}>{status}</span>;
  };

  const loadingValue = '...';

  return (
    <UserLayout>
      <div className="container-fluid py-4">
        <header className="page-header mb-4">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="text-secondary">Monitor your food rescue operations</p>
          </div>
        </header>

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
            value={isLoading ? loadingValue : stats.ordersToday}
            iconBgColor="#fff4e7"
          />
        </div>

        <div className="data-grid mt-4">
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

          <div className="card">
            <div className="card-header">
              <h3>Recent Orders</h3>
            </div>
            <div className="card-body">
              <ul className="activity-list">
                {isLoading ? (
                  <li>Loading...</li>
                ) : error ? (
                  <li>Error loading orders.</li>
                ) : recentOrders.length === 0 ? (
                  <li>No recent orders.</li>
                ) : (
                  recentOrders.map(order => (
                    <li key={order.orderId}>
                      <div className="activity-details">
                        <strong>{order.recipientName}</strong>
                        <span>Order ID: {order.orderId.substring(0, 8)}...</span>
                      </div>
                      <span className="activity-time">
                        {getOrderStatusBadge(order.status)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default AdminDashboard;