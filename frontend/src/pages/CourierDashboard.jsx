import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock data for available jobs
const availableJobsData = [
  {
    id: "JOB-001",
    orderId: "ORDER-101",
    donorName: "Sunrise Bakery",
    donorAddress: "123 Main St, Downtown",
    recipientName: "Community Food Bank",
    recipientAddress: "456 Oak Ave, Riverside",
    foodItems: ["Fresh Bread", "Pastries", "Croissants"],
    distance: "2.3 km",
    estimatedTime: "15 min",
    servings: 25,
    status: "available",
    urgency: "high",
    assigned_at: null,
    completed_at: null,
    notes: "Handle with care - fragile items included"
  },
  {
    id: "JOB-002",
    orderId: "ORDER-102",
    donorName: "Green Valley Restaurant",
    donorAddress: "789 Park Blvd, Westside",
    recipientName: "Hope Shelter",
    recipientAddress: "321 Pine St, Eastside",
    foodItems: ["Cooked Meals", "Salads", "Fruits"],
    distance: "3.8 km",
    estimatedTime: "20 min",
    servings: 40,
    status: "available",
    urgency: "medium",
    assigned_at: null,
    completed_at: null,
    notes: "Keep refrigerated items cold"
  },
  {
    id: "JOB-003",
    orderId: "ORDER-103",
    donorName: "Fresh Market",
    donorAddress: "555 Commerce Dr, North District",
    recipientName: "Elderly Care Center",
    recipientAddress: "888 Maple Rd, South District",
    foodItems: ["Vegetables", "Dairy Products", "Eggs"],
    distance: "5.2 km",
    estimatedTime: "25 min",
    servings: 30,
    status: "available",
    urgency: "low",
    assigned_at: null,
    completed_at: null,
    notes: "Standard delivery"
  },
];

// Mock data for my jobs
const myJobsData = [
  {
    id: "JOB-004",
    orderId: "ORDER-104",
    donorName: "Organic Café",
    donorAddress: "234 Garden St, Midtown",
    recipientName: "Youth Center",
    recipientAddress: "567 Elm St, Downtown",
    foodItems: ["Sandwiches", "Smoothies", "Snacks"],
    distance: "1.8 km",
    estimatedTime: "12 min",
    servings: 20,
    status: "pickup_pending",
    urgency: "high",
    assigned_at: "2024-01-14T10:30:00",
    completed_at: null,
    notes: "Urgent delivery - call recipient upon arrival"
  },
  {
    id: "JOB-005",
    orderId: "ORDER-105",
    donorName: "Downtown Deli",
    donorAddress: "890 Market St, Center City",
    recipientName: "Family Support Center",
    recipientAddress: "432 Cedar Ave, Hillside",
    foodItems: ["Prepared Meals", "Sides"],
    distance: "4.1 km",
    estimatedTime: "22 min",
    servings: 35,
    status: "delivery_pending",
    urgency: "medium",
    assigned_at: "2024-01-14T09:15:00",
    completed_at: null,
    notes: "Multiple containers - check all items"
  },
];

export default function CourierDashboard() {
  const navigate = useNavigate();
  const [availableJobs, setAvailableJobs] = useState(availableJobsData);
  const [myJobs, setMyJobs] = useState(myJobsData);
  const [activeTab, setActiveTab] = useState("available");
  
  // Debug: Log when component renders
  React.useEffect(() => {
    console.log('CourierDashboard mounted', { availableJobs: availableJobs.length, myJobs: myJobs.length });
  }, []);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    type: "pickup",
    jobId: "",
    name: "",
  });
  
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    jobId: "",
    jobName: "",
  });

  const [stats, setStats] = useState({
    mealsDelivered: 342,
    peopleHelped: 89,
    completed: 18,
    rating: 4.9,
  });

  const handleAcceptJob = (jobId) => {
    // Check if courier already has a job
    if (myJobs.length > 0) {
      toast.error("You can only have one active job at a time", {
        duration: 4000,
      });
      return;
    }

    const job = availableJobs.find((j) => j.id === jobId);
    if (job) {
      const acceptedJob = { 
        ...job, 
        status: "pickup_pending",
        assigned_at: new Date().toISOString()
      };
      setMyJobs([acceptedJob]);
      setAvailableJobs(availableJobs.filter((j) => j.id !== jobId));
      
      setTimeout(() => {
        setActiveTab("my-jobs");
      }, 300);
      
      toast.success("Job accepted! Get ready for pickup.", {
        duration: 4000,
      });
    }
  };

  const handleConfirmPickup = (jobId) => {
    const job = myJobs.find((j) => j.id === jobId);
    if (job) {
      setConfirmationDialog({
        open: true,
        type: "pickup",
        jobId,
        name: job.donorName,
      });
      navigate('/courier-verification', { state: { jobData: job, verificationType: 'pickup' } });
    }
  };

  const handleConfirmDelivery = (jobId) => {
    const job = myJobs.find((j) => j.id === jobId);
    if (job) {
      setConfirmationDialog({
        open: true,
        type: "delivery",
        jobId,
        name: job.recipientName,
      });
      navigate('/courier-verification', { state: { jobData: job, verificationType: 'delivery' } });
    }
  };

  const handleCancelJob = (jobId) => {
    const job = myJobs.find((j) => j.id === jobId);
    if (job) {
      setCancelDialog({
        open: true,
        jobId,
        jobName: job.donorName,
      });
    }
  };

  const handleConfirmCancel = (reason) => {
    const job = myJobs.find((j) => j.id === cancelDialog.jobId);
    if (job) {
      setMyJobs([]);
      setCancelDialog({ open: false, jobId: "", jobName: "" });
      
      setTimeout(() => {
        setActiveTab("available");
      }, 500);
      
      toast.info("Job cancelled", {
        duration: 4000,
      });
    }
  };

  const handleConfirmation = (method, code) => {
    const { jobId, type } = confirmationDialog;
    const job = myJobs.find((j) => j.id === jobId);
    
    if (job) {
      if (type === "pickup") {
        const updatedJob = { ...job, status: "delivery_pending" };
        setMyJobs(myJobs.map((j) => (j.id === jobId ? updatedJob : j)));
        toast.success("Pickup confirmed!", {
          duration: 4000,
        });
      } else {
        const completedJob = { ...job, completed_at: new Date().toISOString() };
        setMyJobs([]);
        setStats({
          ...stats,
          mealsDelivered: stats.mealsDelivered + job.servings,
          peopleHelped: stats.peopleHelped + Math.floor(job.servings / 3),
          completed: stats.completed + 1,
        });
        
        setTimeout(() => {
          setActiveTab("available");
        }, 1500);
        
        toast.success("Delivery completed! 🎉", {
          duration: 4000,
        });
      }
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "high":
        return <Badge bg="danger">High Priority</Badge>;
      case "medium":
        return <Badge bg="warning" className="text-dark">Medium Priority</Badge>;
      case "low":
        return <Badge bg="success">Low Priority</Badge>;
      default:
        return <Badge bg="secondary">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge bg="info">Available</Badge>;
      case "pickup_pending":
        return <Badge bg="warning" className="text-dark">Pickup Pending</Badge>;
      case "delivery_pending":
        return <Badge bg="primary">Delivery Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      margin: 0,
      padding: 0,
      overflow: 'auto',
      background: 'linear-gradient(to bottom right, #f9fafb 0%, rgba(236, 253, 245, 0.3) 50%, rgba(204, 251, 241, 0.3) 100%)'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}>
        <div className="container-fluid" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div className="px-4 py-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                <div className="p-2" style={{
                  background: 'linear-gradient(to bottom right, #10b981 0%, #14b8a6 100%)',
                  borderRadius: '12px'
                }}>
                  <i className="fas fa-box" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                </div>
                <div>
                  <h1 style={{ fontSize: '1.25rem', color: '#111827', margin: 0, fontWeight: '600' }}>Food Rescue Live</h1>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Courier Dashboard</p>
                </div>
              </div>

              <div className="d-flex align-items-center" style={{ gap: '16px' }}>
                <Button 
                  variant="light"
                  size="sm"
                  style={{ position: 'relative', background: 'transparent', border: 'none', padding: '8px' }}
                >
                  <i className="fas fa-bell" style={{ fontSize: '1.25rem', color: '#374151' }}></i>
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    background: '#ef4444',
                    borderRadius: '50%'
                  }}></span>
                </Button>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(to bottom right, #10b981 0%, #14b8a6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <i className="fas fa-user" style={{ fontSize: '1.25rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid" style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', width: '100%' }}>
          {/* Hero Section */}
          <div className="position-relative overflow-hidden mb-4" style={{
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px',
            height: '200px'
          }}>
            <div className="position-absolute w-100 h-100" style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1593929976216-f746e488aa45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMGNvdXJpZXIlMjBiaWtlfGVufDF8fHx8MTc2MTcxNzI1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div className="position-absolute w-100 h-100" style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to right, rgba(5, 150, 105, 0.9) 0%, rgba(15, 118, 110, 0.7) 100%)'
              }}></div>
            </div>
            <div className="position-relative px-5 py-4 h-100 d-flex flex-column justify-content-center">
              <Badge className="mb-3" style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#a7f3d0',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.875rem',
                padding: '6px 12px',
                width: 'fit-content'
              }}>
                <i className="fas fa-heart me-1" style={{ fontSize: '0.75rem' }}></i>
                Volunteer Active
              </Badge>
              <h2 style={{ fontSize: '2.25rem', color: '#fff', marginBottom: '8px', fontWeight: 'bold' }}>Welcome back, Alex! 👋</h2>
              <p style={{ color: '#a7f3d0', fontSize: '1.125rem', marginBottom: '8px' }}>Ready to rescue food and help the community?</p>
              <p style={{ color: 'rgba(167, 243, 208, 0.8)', fontSize: '0.875rem', marginTop: '8px' }}>Every delivery you make fights hunger and reduces food waste.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <Row className="g-3 mb-4">
            <Col md={3} sm={6}>
              <Card className="h-100" style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <Card.Body className="p-4 h-100 d-flex align-items-center">
                  <div className="d-flex align-items-center w-100">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(to bottom right, #10b981 0%, #14b8a6 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      <i className="fas fa-box" style={{ fontSize: '1.25rem', color: '#fff' }}></i>
                    </div>
                    <div style={{ flex: 1, minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Meals Delivered</p>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                        {stats.mealsDelivered}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '4px 0 0 0' }}>+45 this week</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="h-100" style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <Card.Body className="p-4 h-100 d-flex align-items-center">
                  <div className="d-flex align-items-center w-100">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(to bottom right, #3b82f6 0%, #06b6d4 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      <i className="fas fa-users" style={{ fontSize: '1.25rem', color: '#fff' }}></i>
                    </div>
                    <div style={{ flex: 1, minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>People Helped</p>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                        {stats.peopleHelped}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: '4px 0 0 0' }}>+12 this week</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="h-100" style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <Card.Body className="p-4 h-100 d-flex align-items-center">
                  <div className="d-flex align-items-center w-100">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(to bottom right, #a855f7 0%, #ec4899 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      <i className="fas fa-chart-line" style={{ fontSize: '1.25rem', color: '#fff' }}></i>
                    </div>
                    <div style={{ flex: 1, minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Total Rescues</p>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                        {stats.completed}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#a855f7', margin: '4px 0 0 0' }}>Keep up the great work!</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="h-100" style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <Card.Body className="p-4 h-100 d-flex align-items-center">
                  <div className="d-flex align-items-center w-100">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(to bottom right, #f59e0b 0%, #f97316 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      <i className="fas fa-star" style={{ fontSize: '1.25rem', color: '#fff' }}></i>
                    </div>
                    <div style={{ flex: 1, minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Impact Score</p>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>
                        {stats.rating}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#f59e0b', margin: '4px 0 0 0' }}>Outstanding volunteer!</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        {/* Jobs Section */}
        <div style={{ width: '100%' }}>
          {/* Tabs */}
          <div className="d-flex mb-4" style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            height: '48px',
            width: '100%'
          }}>
              <button
                type="button"
                className="btn flex-fill"
                onClick={() => setActiveTab("available")}
                disabled={myJobs.length > 0}
                style={{
                  background: activeTab === "available" ? '#fff' : 'transparent',
                  color: activeTab === "available" ? '#111827' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  height: '100%',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === "available" ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                <i className="fas fa-chart-line me-2" style={{ fontSize: '1rem' }}></i>
                Available Jobs ({availableJobs.length})
              </button>
              <button
                type="button"
                className="btn flex-fill"
                onClick={() => setActiveTab("my-jobs")}
                style={{
                  background: activeTab === "my-jobs" ? '#fff' : 'transparent',
                  color: activeTab === "my-jobs" ? '#111827' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  height: '100%',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === "my-jobs" ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                <i className="fas fa-map-marker-alt me-2" style={{ fontSize: '1rem' }}></i>
                My Jobs ({myJobs.length})
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "available" && (
                <div>
                  {myJobs.length > 0 ? (
                    <div className="text-center py-5">
                      <div className="position-relative d-inline-block mb-3">
                        <i className="fas fa-box" style={{ fontSize: '4rem', color: '#86efac' }}></i>
                        <div className="position-absolute" style={{
                          top: '-8px',
                          right: '-8px',
                          width: '32px',
                          height: '32px',
                          background: '#10b981',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 'bold' }}>1</span>
                        </div>
                      </div>
                      <p style={{ color: '#4b5563', marginBottom: '8px' }}>You have an active job!</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Complete or cancel your current job to see available jobs.</p>
                    </div>
                  ) : availableJobs.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-box" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '16px' }}></i>
                      <p style={{ color: '#6b7280' }}>No available jobs at the moment</p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '8px' }}>Check back soon for new opportunities!</p>
                    </div>
                  ) : (
                    <div>
                      {availableJobs.map((job) => (
                        <Card key={job.id} className="mb-4" style={{
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '16px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                          <Card.Body className="p-4">
                            {/* Section 1: Job Identification */}
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4" style={{ 
                              paddingBottom: '16px',
                              borderBottom: '2px solid #e5e7eb'
                            }}>
                              <div className="d-flex flex-wrap align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-briefcase" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                                  <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                    Job ID:
                                  </small>
                                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.id}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-shopping-cart" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                                  <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                    Order ID:
                                  </small>
                                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.orderId}</span>
                                </div>
                              </div>
                              {getStatusBadge(job.status)}
                            </div>

                            {/* Section 2: Pickup Location */}
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="fas fa-store" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Pickup From
                                    </small>
                                  </div>
                                  <h6 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                    {job.donorName}
                                  </h6>
                                  <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    <i className="fas fa-map-marker-alt me-1" style={{ color: '#ef4444' }}></i>
                                    {job.donorAddress}
                                  </small>
                                </div>
                                <div className="ms-2">
                                  {getUrgencyBadge(job.urgency)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Section 3: Delivery Location */}
                            <div className="mb-4" style={{
                              padding: '16px',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              borderLeft: '3px solid #10b981'
                            }}>
                              <div className="d-flex align-items-start gap-2 mb-1">
                                <i className="fas fa-arrow-right mt-1" style={{ color: '#10b981', fontSize: '1rem' }}></i>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="fas fa-home" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Deliver To
                                    </small>
                                  </div>
                                  <h6 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                    {job.recipientName}
                                  </h6>
                                  <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    <i className="fas fa-map-marker-alt me-1" style={{ color: '#10b981' }}></i>
                                    {job.recipientAddress}
                                  </small>
                                </div>
                              </div>
                            </div>

                            {/* Section 4: Delivery Details Grid */}
                            <div className="mb-4">
                              <small className="d-block mb-3" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <i className="fas fa-info-circle me-1"></i>
                                Delivery Details
                              </small>
                              <Row className="g-3">
                                <Col xs={4}>
                                  <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                      {job.distance}
                                    </div>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      <i className="fas fa-route me-1"></i>
                                      Distance
                                    </small>
                                  </div>
                                </Col>
                                <Col xs={4}>
                                  <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                      {job.estimatedTime}
                                    </div>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      <i className="fas fa-clock me-1"></i>
                                      Time
                                    </small>
                                  </div>
                                </Col>
                                <Col xs={4}>
                                  <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                      {job.servings}
                                    </div>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      <i className="fas fa-users me-1"></i>
                                      Servings
                                    </small>
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {/* Section 5: Items */}
                            <div className="mb-4">
                              <small className="d-block mb-2" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <i className="fas fa-box me-1"></i>
                                Food Items
                              </small>
                              <div className="d-flex flex-wrap gap-2">
                                {job.foodItems.map((item, idx) => (
                                  <Badge key={idx} bg="secondary" style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px' }}>
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Section 6: Timeline & Notes */}
                            <div className="mb-3" style={{ 
                              padding: '12px',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              borderTop: '1px solid #e5e7eb'
                            }}>
                              <small className="d-block mb-2" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <i className="fas fa-history me-1"></i>
                                Timeline
                              </small>
                              <div className="d-flex flex-wrap gap-3 mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-calendar-check" style={{ fontSize: '0.875rem', color: '#3b82f6' }}></i>
                                  <div>
                                    <small className="d-block" style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      Assigned
                                    </small>
                                    <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: '500' }}>
                                      {formatDate(job.assigned_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-check-circle" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                  <div>
                                    <small className="d-block" style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      Completed
                                    </small>
                                    <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: '500' }}>
                                      {formatDate(job.completed_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {job.notes && (
                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <div className="d-flex align-items-start gap-2">
                                    <i className="fas fa-sticky-note mt-1" style={{ fontSize: '0.875rem', color: '#f59e0b' }}></i>
                                    <div className="flex-grow-1">
                                      <small className="d-block mb-1" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Important Notes
                                      </small>
                                      <p style={{ fontSize: '0.85rem', color: '#111827', margin: 0, lineHeight: '1.5' }}>
                                        {job.notes}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              className="w-100"
                              style={{
                                background: 'linear-gradient(to bottom right, #10b981 0%, #14b8a6 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                              }}
                              onClick={() => handleAcceptJob(job.id)}
                            >
                              Accept Job
                            </Button>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "my-jobs" && (
                <div>
                  {myJobs.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-map-marker-alt" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '16px' }}></i>
                      <p style={{ color: '#6b7280' }}>No active jobs</p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '8px' }}>Accept a job from available jobs to get started!</p>
                    </div>
                  ) : (
                    <div>
                      {myJobs.map((job) => (
                        <Card key={job.id} className="mb-4" style={{
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '16px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                          <Card.Body className="p-4">
                            {/* Section 1: Job Identification */}
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4" style={{ 
                              paddingBottom: '16px',
                              borderBottom: '2px solid #e5e7eb'
                            }}>
                              <div className="d-flex flex-wrap align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-briefcase" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                                  <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                    Job ID:
                                  </small>
                                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.id}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-shopping-cart" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                                  <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                    Order ID:
                                  </small>
                                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.orderId}</span>
                                </div>
                              </div>
                              {getStatusBadge(job.status)}
                            </div>

                            {/* Section 2: Pickup Location */}
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="fas fa-store" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Pickup From
                                    </small>
                                  </div>
                                  <h6 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                    {job.donorName}
                                  </h6>
                                  <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    <i className="fas fa-map-marker-alt me-1" style={{ color: '#ef4444' }}></i>
                                    {job.donorAddress}
                                  </small>
                                </div>
                              </div>
                            </div>
                            
                            {/* Section 3: Delivery Location */}
                            <div className="mb-4" style={{
                              padding: '16px',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              borderLeft: '3px solid #10b981'
                            }}>
                              <div className="d-flex align-items-start gap-2 mb-1">
                                <i className="fas fa-arrow-right mt-1" style={{ color: '#10b981', fontSize: '1rem' }}></i>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="fas fa-home" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Deliver To
                                    </small>
                                  </div>
                                  <h6 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                    {job.recipientName}
                                  </h6>
                                  <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    <i className="fas fa-map-marker-alt me-1" style={{ color: '#10b981' }}></i>
                                    {job.recipientAddress}
                                  </small>
                                </div>
                              </div>
                            </div>

                            {/* Section 4: Delivery Details Grid */}
                            <div className="mb-4">
                              <small className="d-block mb-3" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <i className="fas fa-info-circle me-1"></i>
                                Delivery Details
                              </small>
                              <Row className="g-3">
                                <Col xs={4}>
                                  <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                      {job.distance}
                                    </div>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      <i className="fas fa-route me-1"></i>
                                      Distance
                                    </small>
                                  </div>
                                </Col>
                                <Col xs={4}>
                                  <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                      {job.estimatedTime}
                                    </div>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      <i className="fas fa-clock me-1"></i>
                                      Time
                                    </small>
                                  </div>
                                </Col>
                                <Col xs={4}>
                                  <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                      {job.servings}
                                    </div>
                                    <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      <i className="fas fa-users me-1"></i>
                                      Servings
                                    </small>
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {/* Section 5: Items */}
                            <div className="mb-4">
                              <small className="d-block mb-2" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <i className="fas fa-box me-1"></i>
                                Food Items
                              </small>
                              <div className="d-flex flex-wrap gap-2">
                                {job.foodItems.map((item, idx) => (
                                  <Badge key={idx} bg="secondary" style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px' }}>
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Section 6: Timeline & Notes */}
                            <div className="mb-3" style={{ 
                              padding: '12px',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              borderTop: '1px solid #e5e7eb'
                            }}>
                              <small className="d-block mb-2" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <i className="fas fa-history me-1"></i>
                                Timeline
                              </small>
                              <div className="d-flex flex-wrap gap-3 mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-calendar-check" style={{ fontSize: '0.875rem', color: '#3b82f6' }}></i>
                                  <div>
                                    <small className="d-block" style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      Assigned
                                    </small>
                                    <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: '500' }}>
                                      {formatDate(job.assigned_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fas fa-check-circle" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                  <div>
                                    <small className="d-block" style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                      Completed
                                    </small>
                                    <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: '500' }}>
                                      {formatDate(job.completed_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {job.notes && (
                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <div className="d-flex align-items-start gap-2">
                                    <i className="fas fa-sticky-note mt-1" style={{ fontSize: '0.875rem', color: '#f59e0b' }}></i>
                                    <div className="flex-grow-1">
                                      <small className="d-block mb-1" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Important Notes
                                      </small>
                                      <p style={{ fontSize: '0.85rem', color: '#111827', margin: 0, lineHeight: '1.5' }}>
                                        {job.notes}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="d-grid gap-2">
                              {job.status === "pickup_pending" && (
                                <Button
                                  style={{
                                    background: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                  }}
                                  onClick={() => handleConfirmPickup(job.id)}
                                >
                                  <i className="fas fa-check-circle me-2"></i>
                                  Confirm Pickup
                                </Button>
                              )}
                              {job.status === "delivery_pending" && (
                                <Button
                                  style={{
                                    background: '#10b981',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                  }}
                                  onClick={() => handleConfirmDelivery(job.id)}
                                >
                                  <i className="fas fa-check-circle me-2"></i>
                                  Confirm Delivery
                                </Button>
                              )}
                              <Button
                                variant="outline-secondary"
                                style={{
                                  borderRadius: '8px',
                                  fontSize: '0.875rem'
                                }}
                                onClick={() => handleCancelJob(job.id)}
                              >
                                <i className="fas fa-times me-2"></i>
                                Cancel Job
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Confirmation Dialog */}
      <Modal
        show={confirmationDialog.open}
        onHide={() => setConfirmationDialog({ ...confirmationDialog, open: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {confirmationDialog.type === "pickup" ? "Confirm Pickup" : "Confirm Delivery"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please use the verification page to confirm {confirmationDialog.type}.</p>
          <p className="text-muted">Location: {confirmationDialog.name}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmationDialog({ ...confirmationDialog, open: false })}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setConfirmationDialog({ ...confirmationDialog, open: false });
            }}
          >
            Continue to Verification
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Job Dialog */}
      <Modal
        show={cancelDialog.open}
        onHide={() => setCancelDialog({ ...cancelDialog, open: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this job?</p>
          <p className="text-muted">Job: {cancelDialog.jobName}</p>
          <p className="text-muted small">The job will be made available for other couriers.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setCancelDialog({ ...cancelDialog, open: false })}
          >
            No, Keep Job
          </Button>
          <Button
            variant="danger"
            onClick={() => handleConfirmCancel("User cancelled")}
          >
            Yes, Cancel Job
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
