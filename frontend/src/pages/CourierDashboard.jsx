import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useJobData } from '../context/JobDataContext';
import OrderList from '../components/courier/OrderList';
import JobList from '../components/courier/JobList';

export default function CourierDashboard() {
  const navigate = useNavigate();
  const { setJobForVerification } = useJobData();
  const [activeTab, setActiveTab] = useState("orders");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setAvailableOrders([
      {
        id: "ORD-001",
        receiverName: "Sarah Johnson",
        pickupAddress: "550 Market Street, City, State 12345",
        deliveryAddress: "123 Main Street, City, State 12345",
        status: "pending",
        notes: "Fresh vegetables"
      },
      {
        id: "ORD-002",
        receiverName: "Michael Chen",
        pickupAddress: "221 Broadway Avenue, City, State 12345",
        deliveryAddress: "456 Oak Avenue, City, State 12345",
        status: "pending",
        notes: "Prepared meals"
      },
      {
        id: "ORD-003",
        receiverName: "Emily Rodriguez",
        pickupAddress: "88 Park Avenue, City, State 12345",
        deliveryAddress: "789 Pine Road, City, State 12345",
        status: "pending",
        notes: "Light packages"
      }
    ]);
    
    setMyJobs([
      {
        id: "JOB-001",
        receiverName: "David Thompson",
        pickupAddress: "789 Business Plaza, City, State 12345",
        deliveryAddress: "321 Care Way, City, State 12345",
        status: "assigned",
        assignedAt: "2024-01-14"
      },
      {
        id: "JOB-002",
        receiverName: "Lisa Martinez",
        pickupAddress: "456 Restaurant Row, City, State 12345",
        deliveryAddress: "456 Help Street, City, State 12345",
        status: "in-progress",
        assignedAt: "2024-01-13"
      }
    ]);
    
    setIsLoading(false);
  };

  const handleClaimOrder = (orderId) => {
    const orderToClaim = availableOrders.find(order => order.id === orderId);
    if (orderToClaim) {
      setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
      setMyJobs(prev => [...prev, {
        id: `JOB-${Math.random().toString(36).substr(2, 9)}`,
        receiverName: orderToClaim.receiverName,
        pickupAddress: orderToClaim.pickupAddress,
        deliveryAddress: orderToClaim.deliveryAddress,
        status: "assigned",
        assignedAt: new Date().toISOString().slice(0, 10)
      }]);
      toast.success(`Order ${orderId} claimed successfully!`);
    }
  };

  const handleStartDelivery = (jobId) => {
    const job = myJobs.find(j => j.id === jobId);
    if (job) {
      setMyJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, status: "in-progress" } : j
      ));
      toast.success(`Delivery started for ${jobId}!`);
      navigate('/jobs', { state: { jobData: job } });
    }
  };

  const handleCancelJob = (jobId) => {
    const jobToCancel = myJobs.find(job => job.id === jobId);
    if (jobToCancel) {
      setMyJobs(prev => prev.filter(job => job.id !== jobId));
      setAvailableOrders(prev => [...prev, {
        id: jobToCancel.id.replace('JOB-', 'ORD-'),
        receiverName: jobToCancel.receiverName,
        pickupAddress: jobToCancel.pickupAddress,
        deliveryAddress: jobToCancel.deliveryAddress,
        status: "pending",
        notes: "Cancelled job - available for claim"
      }]);
      toast.success(`Job ${jobId} cancelled and moved back to available orders!`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { bg: "#ff9500", text: "#000" };
      case "assigned":
        return { bg: "#007aff", text: "#fff" };
      case "in-progress":
        return { bg: "#ff9500", text: "#000" };
      case "completed":
        return { bg: "#34c759", text: "#fff" };
      default:
        return { bg: "#8e8e93", text: "#fff" };
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid" style={{ 
        background: '#000000',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p style={{ color: '#ffffff' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
          .container-fluid {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        `}
      </style>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #333333',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#34c759',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff3b30',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <div className="container-fluid" style={{ 
        background: '#000000',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto'
      }}>
        {/* Mobile-Friendly Header */}
        <div className="px-3 py-3" style={{ 
          background: '#1a1a1a',
          borderBottom: '1px solid #333'
        }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <div style={{
                width: '45px',
                height: '45px',
                background: '#007aff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <i className="fas fa-truck" style={{ fontSize: '1.1rem', color: '#fff' }}></i>
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#fff', fontSize: '1rem' }}>
                  Courier
                </h5>
                <small style={{ color: '#a1a1a6', fontSize: '0.7rem' }}>
                  Dashboard
                </small>
              </div>
            </div>
            <Button
              variant="outline-light"
              size="sm"
              style={{ 
                borderColor: '#333',
                color: '#fff',
                background: 'transparent',
                borderRadius: '8px',
                fontSize: '0.75rem',
                padding: '6px 12px'
              }}
              onClick={() => navigate('/jobs')}
            >
              <i className="fas fa-history me-1" style={{ fontSize: '0.7rem' }}></i>
              Delivery History
            </Button>
          </div>

          {/* Stats Row */}
          <div className="row g-2">
            <div className="col-6">
              <div className="p-3" style={{
                background: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div className="text-center">
                  <i className="fas fa-box mb-2" style={{ fontSize: '1rem', color: '#007aff' }}></i>
                  <h4 className="fw-bold mb-1" style={{ color: '#007aff', fontSize: '1.2rem' }}>
                    {availableOrders.length}
                  </h4>
                  <small style={{ color: '#ffffff', fontSize: '0.65rem' }}>
                    Orders
                  </small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3" style={{
                background: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div className="text-center">
                  <i className="fas fa-briefcase mb-2" style={{ fontSize: '1rem', color: '#34c759' }}></i>
                  <h4 className="fw-bold mb-1" style={{ color: '#34c759', fontSize: '1.2rem' }}>
                    {myJobs.length}
                  </h4>
                  <small style={{ color: '#ffffff', fontSize: '0.65rem' }}>
                    Jobs
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="px-3 py-3">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn py-3 ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
              style={{
                background: activeTab === "orders" ? '#007aff' : 'transparent',
                color: activeTab === "orders" ? '#fff' : '#a1a1a6',
                border: '1px solid #333',
                borderRadius: '10px 0 0 10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                flex: 1
              }}
            >
              <i className="fas fa-box me-2" style={{ fontSize: '0.8rem' }}></i>
              Orders
            </button>
            <button
              type="button"
              className={`btn py-3 ${activeTab === "jobs" ? "active" : ""}`}
              onClick={() => setActiveTab("jobs")}
              style={{
                background: activeTab === "jobs" ? '#34c759' : 'transparent',
                color: activeTab === "jobs" ? '#fff' : '#a1a1a6',
                border: '1px solid #333',
                borderRadius: '0 10px 10px 0',
                fontSize: '0.9rem',
                fontWeight: '600',
                flex: 1
              }}
            >
              <i className="fas fa-briefcase me-2" style={{ fontSize: '0.8rem' }}></i>
              Jobs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-3">
          {activeTab === "orders" ? (
            <OrderList 
              orders={availableOrders} 
              onClaimOrder={handleClaimOrder} 
            />
          ) : (
            <JobList 
              jobs={myJobs} 
              onStartDelivery={handleStartDelivery}
              onCancelJob={handleCancelJob}
            />
          )}
        </div>
      </div>
    </>
  );
}
