import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useJobData } from '../context/JobDataContext';

export default function JobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setJobForVerification } = useJobData();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState({}); // Track verification status

  useEffect(() => {
    fetchJobs();
    
    // Check if job data was passed from dashboard
    if (location.state?.jobData) {
      const incomingJob = location.state.jobData;
      setJobs(prev => {
        const existingJob = prev.find(j => j.id === incomingJob.id);
        if (existingJob) {
          return prev.map(j => j.id === incomingJob.id ? { ...incomingJob, status: "in-progress" } : j);
        } else {
          return [...prev, { ...incomingJob, status: "in-progress" }];
        }
      });
      setFilterStatus("in-progress"); // Auto-filter to show the started job
    }
  }, [location.state]);

  const fetchJobs = async () => {
    setIsLoading(true);
    // Mock data - replace with actual API calls
    setJobs([
      {
        id: "JOB-001",
        receiverName: "David Thompson",
        pickupAddress: "789 Business Plaza, City, State 12345",
        deliveryAddress: "321 Care Way, City, State 12345",
        status: "assigned",
        assignedAt: "2024-01-14",
        priority: "high"
      },
      {
        id: "JOB-002",
        receiverName: "Lisa Martinez",
        pickupAddress: "456 Restaurant Row, City, State 12345",
        deliveryAddress: "456 Help Street, City, State 12345",
        status: "in-progress",
        assignedAt: "2024-01-13",
        priority: "medium"
      },
      {
        id: "JOB-003",
        receiverName: "James Wilson",
        pickupAddress: "123 Food Court, City, State 12345",
        deliveryAddress: "789 Oak Street, City, State 12345",
        status: "completed",
        assignedAt: "2024-01-12",
        priority: "low"
      },
      {
        id: "JOB-004",
        receiverName: "Maria Garcia",
        pickupAddress: "555 Market Square, City, State 12345",
        deliveryAddress: "321 Elm Avenue, City, State 12345",
        status: "assigned",
        assignedAt: "2024-01-15",
        priority: "high"
      }
    ]);
    
    setIsLoading(false);
  };

  const handleStartDelivery = (jobId) => {
    console.log('Starting delivery for job:', jobId);
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: "in-progress" } : job
    ));
    toast.success(`Delivery started for ${jobId}!`);
  };

  const handleCompleteJob = (jobId) => {
    console.log('Completing job:', jobId);
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: "completed" } : job
    ));
    toast.success(`Job ${jobId} completed successfully!`);
  };

  const handleVerifyPickup = (jobId) => {
    console.log('Verifying pickup for job:', jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setJobForVerification(job, 'pickup', () => handleVerificationComplete(jobId, 'pickup'));
      toast.success(`Starting pickup verification for ${jobId}!`);
      navigate('/courier-verification');
    }
  };

  const handleVerifyDelivery = (jobId) => {
    console.log('Verifying delivery for job:', jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setJobForVerification(job, 'delivery', () => handleVerificationComplete(jobId, 'delivery'));
      toast.success(`Starting delivery verification for ${jobId}!`);
      navigate('/courier-verification');
    }
  };

  const handleVerificationComplete = (jobId, type) => {
    console.log(`Verification complete for ${jobId} - ${type}`);
    setVerificationStatus(prev => ({
      ...prev,
      [`${jobId}_${type}`]: true
    }));
    toast.success(`${type === 'pickup' ? 'Pickup' : 'Delivery'} verification completed for ${jobId}!`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return { bg: "#ff3b30", text: "#fff" };
      case "medium":
        return { bg: "#ff9500", text: "#000" };
      case "low":
        return { bg: "#34c759", text: "#fff" };
      default:
        return { bg: "#8e8e93", text: "#fff" };
    }
  };

  const filteredJobs = filterStatus === "all" 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

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
          <p style={{ color: '#ffffff' }}>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
                background: '#34c759',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <i className="fas fa-briefcase" style={{ fontSize: '1.1rem', color: '#fff' }}></i>
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#fff', fontSize: '1rem' }}>
                  My Jobs
                </h5>
                <small style={{ color: '#a1a1a6', fontSize: '0.7rem' }}>
                  Delivery Management
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
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left me-1" style={{ fontSize: '0.7rem' }}></i>
              Back
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
                  <i className="fas fa-clipboard-list mb-2" style={{ fontSize: '1rem', color: '#34c759' }}></i>
                  <h4 className="fw-bold mb-1" style={{ color: '#34c759', fontSize: '1.2rem' }}>
                    {jobs.length}
                  </h4>
                  <small style={{ color: '#ffffff', fontSize: '0.65rem' }}>
                    Total Jobs
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
                  <i className="fas fa-clock mb-2" style={{ fontSize: '1rem', color: '#ff9500' }}></i>
                  <h4 className="fw-bold mb-1" style={{ color: '#ff9500', fontSize: '1.2rem' }}>
                    {jobs.filter(j => j.status === "in-progress").length}
                  </h4>
                  <small style={{ color: '#ffffff', fontSize: '0.65rem' }}>
                    In Progress
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="px-3 py-3">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn py-3 ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
              style={{
                background: filterStatus === "all" ? '#34c759' : 'transparent',
                color: filterStatus === "all" ? '#fff' : '#999',
                border: '1px solid #333',
                borderRadius: '10px 0 0 10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                flex: 1
              }}
            >
              <i className="fas fa-list me-2" style={{ fontSize: '0.8rem' }}></i>
              All ({jobs.length})
            </button>
            <button
              type="button"
              className={`btn py-3 ${filterStatus === "assigned" ? "active" : ""}`}
              onClick={() => setFilterStatus("assigned")}
              style={{
                background: filterStatus === "assigned" ? '#007aff' : 'transparent',
                color: filterStatus === "assigned" ? '#fff' : '#999',
                border: '1px solid #333',
                borderRadius: '0',
                fontSize: '0.9rem',
                fontWeight: '600',
                flex: 1
              }}
            >
              <i className="fas fa-user-check me-2" style={{ fontSize: '0.8rem' }}></i>
              Assigned ({jobs.filter(j => j.status === "assigned").length})
            </button>
            <button
              type="button"
              className={`btn py-3 ${filterStatus === "in-progress" ? "active" : ""}`}
              onClick={() => setFilterStatus("in-progress")}
              style={{
                background: filterStatus === "in-progress" ? '#ff9500' : 'transparent',
                color: filterStatus === "in-progress" ? '#fff' : '#999',
                border: '1px solid #333',
                borderRadius: '0',
                fontSize: '0.9rem',
                fontWeight: '600',
                flex: 1
              }}
            >
              <i className="fas fa-truck me-2" style={{ fontSize: '0.8rem' }}></i>
              In Progress ({jobs.filter(j => j.status === "in-progress").length})
            </button>
            <button
              type="button"
              className={`btn py-3 ${filterStatus === "completed" ? "active" : ""}`}
              onClick={() => setFilterStatus("completed")}
              style={{
                background: filterStatus === "completed" ? '#34c759' : 'transparent',
                color: filterStatus === "completed" ? '#fff' : '#999',
                border: '1px solid #333',
                borderRadius: '0 10px 10px 0',
                fontSize: '0.9rem',
                fontWeight: '600',
                flex: 1
              }}
            >
              <i className="fas fa-check-circle me-2" style={{ fontSize: '0.8rem' }}></i>
              Completed ({jobs.filter(j => j.status === "completed").length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 pb-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-5">
              <div style={{
                width: '60px',
                height: '60px',
                background: '#333',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '1px solid #555'
              }}>
                <i className="fas fa-clipboard-list" style={{ fontSize: '1.5rem', color: '#34c759' }}></i>
              </div>
              <h5 className="fw-semibold mb-2" style={{ color: '#fff' }}>
                No jobs found
              </h5>
              <p style={{ color: '#999', margin: 0 }}>
                {filterStatus === "all" 
                  ? "You don't have any jobs assigned yet" 
                  : `No ${filterStatus.replace("-", " ")} jobs at the moment`
                }
              </p>
            </div>
          ) : (
            <div>
              {filteredJobs.map((job) => (
                <Card key={job.id} className="mb-3" style={{ 
                  background: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '12px'
                }}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-semibold mb-0" style={{ color: '#ffffff', fontSize: '1rem' }}>
                          <i className="fas fa-briefcase me-2" style={{ color: '#34c759', fontSize: '0.9rem' }}></i>
                          {job.id}
                        </h6>
                        <Badge 
                          style={{ 
                            backgroundColor: getPriorityBadge(job.priority).bg,
                            color: getPriorityBadge(job.priority).text,
                            fontSize: '0.7rem',
                            padding: '2px 6px'
                          }}
                        >
                          {job.priority}
                        </Badge>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: getStatusBadge(job.status).bg,
                          color: getStatusBadge(job.status).text,
                          fontSize: '0.75rem',
                          padding: '4px 8px'
                        }}
                      >
                        {job.status.replace("-", " ")}
                      </Badge>
                    </div>
                    
                    <Row className="g-3">
                      <Col md={6}>
                        <div>
                          <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>
                            <i className="fas fa-map-marker-alt me-1"></i>
                            Pickup Address
                          </small>
                          <span className="fw-medium" style={{ color: '#ffffff', fontSize: '0.85rem' }}>
                            {job.pickupAddress}
                          </span>
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="mt-2 w-100"
                            style={{ 
                              borderColor: verificationStatus[`${job.id}_pickup`] ? '#34c759' : '#333',
                              color: verificationStatus[`${job.id}_pickup`] ? '#34c759' : '#fff',
                              background: verificationStatus[`${job.id}_pickup`] ? 'rgba(52, 199, 89, 0.1)' : 'transparent',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              padding: '4px 8px'
                            }}
                            onClick={() => handleVerifyPickup(job.id)}
                            disabled={verificationStatus[`${job.id}_pickup`]}
                          >
                            <i className={`fas ${verificationStatus[`${job.id}_pickup`] ? 'fa-check-circle' : 'fa-check-circle'} me-1`} style={{ fontSize: '0.7rem' }}></i>
                            {verificationStatus[`${job.id}_pickup`] ? 'Pickup Complete' : 'Verify Pickup'}
                          </Button>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div>
                          <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>
                            <i className="fas fa-home me-1"></i>
                            Delivery Address
                          </small>
                          <span className="fw-medium" style={{ color: '#ffffff', fontSize: '0.85rem' }}>
                            {job.deliveryAddress}
                          </span>
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="mt-2 w-100"
                            style={{ 
                              borderColor: verificationStatus[`${job.id}_delivery`] ? '#34c759' : '#333',
                              color: verificationStatus[`${job.id}_delivery`] ? '#34c759' : '#fff',
                              background: verificationStatus[`${job.id}_delivery`] ? 'rgba(52, 199, 89, 0.1)' : 'transparent',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              padding: '4px 8px'
                            }}
                            onClick={() => handleVerifyDelivery(job.id)}
                            disabled={verificationStatus[`${job.id}_delivery`]}
                          >
                            <i className={`fas ${verificationStatus[`${job.id}_delivery`] ? 'fa-check-circle' : 'fa-check-circle'} me-1`} style={{ fontSize: '0.7rem' }}></i>
                            {verificationStatus[`${job.id}_delivery`] ? 'Delivery Complete' : 'Verify Delivery'}
                          </Button>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div>
                          <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>
                            <i className="fas fa-user me-1"></i>
                            Receiver
                          </small>
                          <span className="fw-semibold" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                            {job.receiverName}
                          </span>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div>
                          <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>
                            <i className="fas fa-calendar me-1"></i>
                            Assigned Date
                          </small>
                          <span className="fw-medium" style={{ color: '#ffffff', fontSize: '0.85rem' }}>
                            {formatDate(job.assignedAt)}
                          </span>
                        </div>
                      </Col>
                    </Row>

                    {job.status === "assigned" && (
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          className="fw-semibold py-2 flex-grow-1"
                          style={{ 
                            background: '#007aff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            flex: '2'
                          }}
                          onClick={() => handleStartDelivery(job.id)}
                        >
                          <i className="fas fa-play me-2" style={{ fontSize: '0.8rem' }}></i>
                          Start Delivery
                        </Button>
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="fw-semibold"
                          style={{ 
                            borderColor: '#333',
                            color: '#999',
                            background: 'transparent',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                            transition: 'all 0.2s ease',
                            flex: '1',
                            minWidth: '100px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#dc3545';
                            e.target.style.color = '#fff';
                            e.target.style.borderColor = '#dc3545';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#999';
                            e.target.style.borderColor = '#333';
                          }}
                          onClick={() => {
                            setJobs(prev => prev.filter(j => j.id !== job.id));
                            toast.success(`Job ${job.id} cancelled successfully!`);
                          }}
                        >
                          <i className="fas fa-times me-1" style={{ fontSize: '0.7rem' }}></i>
                          Cancel
                        </Button>
                      </div>
                    )}

                    {job.status === "in-progress" && (
                      <Button
                        className="w-100 fw-semibold py-2 mt-3"
                        style={{ 
                          background: '#34c759',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem'
                        }}
                        onClick={() => handleCompleteJob(job.id)}
                      >
                        <i className="fas fa-check me-2" style={{ fontSize: '0.8rem' }}></i>
                        Complete Delivery
                      </Button>
                    )}

                    {job.status === "completed" && (
                      <div 
                        className="w-100 py-2 mt-3 text-center fw-semibold"
                        style={{ 
                          background: '#34c759',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <i className="fas fa-check-circle me-2" style={{ fontSize: '0.8rem' }}></i>
                        Delivery Completed
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
