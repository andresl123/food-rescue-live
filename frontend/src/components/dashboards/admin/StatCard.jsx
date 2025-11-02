import React from 'react';
import './Dashboard.css';

const StatCard = ({ icon, title, value, iconBgColor }) => {
  const iconStyle = {
    backgroundColor: iconBgColor,
  };

  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
      <div className="stat-card-icon" style={iconStyle}>
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};

export default StatCard;