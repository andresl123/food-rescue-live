import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Badge, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import {
  getAvailableJobs,
  getCourierJobs,
  assignCourierToJob,
  unassignCourierFromJob,
  generatePodOtps,
  deletePodsForJob,
  getOrderDetails,
  getAddress,
  getUserName,
} from '../../../services/courierService.jsx';

export default function CourierDashboard({ onShowPOD }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [user, setUser] = useState({ name: "Alex", id: null, email: "" });
  
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

  const addressCacheRef = useRef({});
  const orderCacheRef = useRef({});
  const userCacheRef = useRef({});

  const formatAddress = (address) => {
    if (!address) {
      return "Address not available";
    }
    const { street, city, state, postalCode, country } = address;
    return [street, city, state, postalCode, country].filter(Boolean).join(", ");
  };

  const loadOrderDetails = async (orderId) => {
    if (!orderId) return null;
    if (orderCacheRef.current[orderId]) {
      return orderCacheRef.current[orderId];
    }
    try {
      const order = await getOrderDetails(orderId);
      if (order) {
        orderCacheRef.current[orderId] = order;
      }
      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const loadAddressById = async (addressId) => {
    if (!addressId) return null;
    if (addressCacheRef.current[addressId]) {
      return addressCacheRef.current[addressId];
    }
    try {
      const address = await getAddress(addressId);
      if (address) {
        addressCacheRef.current[addressId] = address;
      }
      return address;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  const loadUserNameById = async (userId) => {
    if (!userId) return null;
    if (userCacheRef.current[userId]) {
      return userCacheRef.current[userId];
    }
    try {
      const name = await getUserName(userId);
      if (name) {
        userCacheRef.current[userId] = name;
      }
      return name;
    } catch (error) {
      console.error('Error fetching user name:', error);
      return null;
    }
  };

  const fetchAndSetCourierFullName = async (courierId) => {
    try {
      const courierName = await loadUserNameById(courierId);
      if (courierName) {
        setUser((prev) => ({ ...prev, name: courierName }));
      }
    } catch (error) {
      console.error('Failed to fetch courier full name:', error);
    }
  };

  const enrichJobWithAddresses = async (job) => {
    if (!job?.orderId) {
      return job;
    }

    try {
      const orderDetails = await loadOrderDetails(job.orderId);
      if (!orderDetails) {
        return job;
      }

      const { pickupAddressId, deliveryAddressId, receiverId } = orderDetails;
      const [pickupAddress, deliveryAddress] = await Promise.all([
        loadAddressById(pickupAddressId),
        loadAddressById(deliveryAddressId),
      ]);

      const receiverName = receiverId ? await loadUserNameById(receiverId) : null;

      return {
        ...job,
        pickupAddressId,
        deliveryAddressId,
        receiverId: receiverId ?? job.receiverId,
        donorAddress: pickupAddress ? formatAddress(pickupAddress) : job.donorAddress,
        recipientAddress: deliveryAddress ? formatAddress(deliveryAddress) : job.recipientAddress,
        recipientName: receiverName || job.recipientName || `Recipient for ${job.orderId}`,
        pickupAddress,
        deliveryAddress,
        receiverName,
      };
    } catch (error) {
      console.error('Failed to enrich job with addresses:', error);
      return job;
    }
  };

  const enrichJobsBatch = async (jobs) => {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return jobs;
    }
    return Promise.all(jobs.map(enrichJobWithAddresses));
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const derivedName = decoded.email?.split("@")[0] || decoded.name || "Alex";
        const derivedId = decoded.userId || decoded.id || decoded.sub || decoded.uid || null;
        const derivedEmail = decoded.email || "";

        setUser({
          name: derivedName,
          email: derivedEmail,
          id: derivedId,
        });

        if (derivedId) {
          localStorage.setItem("courierId", derivedId);
          fetchAndSetCourierFullName(derivedId);
        }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // Get courier ID from localStorage or use a default (you may want to get this from auth)
  const getCourierId = () => {
    // For now, using a placeholder. In production, get from auth context or localStorage
    return (
      user.id ||
      localStorage.getItem('courierId') ||
      null
    );
  };

  // Fetch available jobs from API
  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      const jobs = await getAvailableJobs();
      console.log('Available jobs fetched:', jobs);
      
      const mappedJobs = jobs.map(job => ({
        id: job.jobId,
        orderId: job.orderId,
        jobId: job.jobId,
        courierId: job.courierId,
        status: job.status || 'pending',
        assigned_at: job.assignedAt,
        completed_at: job.completedAt,
        notes: job.notes || '',
        donorName: job.donorName || `Donor for ${job.orderId}`,
        donorAddress: job.donorAddress || "Address unavailable",
        recipientName: job.recipientName || `Recipient for ${job.orderId}`,
        recipientAddress: job.recipientAddress || "Address unavailable",
        foodItems: job.foodItems && job.foodItems.length ? job.foodItems : ["Food items from order"],
        distance: job.distance || "N/A",
        estimatedTime: job.estimatedTime || "N/A",
        servings: job.servings ?? 0,
        urgency: job.urgency || "medium"
      }));
      
      const enrichedJobs = await enrichJobsBatch(mappedJobs);
      setAvailableJobs(enrichedJobs);
    } catch (error) {
      console.error('Error fetching available jobs:', error);
      toast.error('Failed to load available jobs.');
      setAvailableJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch my jobs (jobs assigned to this courier)
  const fetchMyJobs = async () => {
    try {
      const courierId = getCourierId();
      if (!courierId) {
        toast.error("Unable to determine courier ID. Please sign in again.", {
          duration: 4000,
        });
        return;
      }
      const jobs = await getCourierJobs(courierId);
      console.log('My jobs fetched:', jobs);
      
      const mappedJobs = jobs.map(job => ({
        id: job.jobId,
        orderId: job.orderId,
        jobId: job.jobId,
        courierId: job.courierId,
        status: job.status || 'pending',
        assigned_at: job.assignedAt,
        completed_at: job.completedAt,
        notes: job.notes || '',
        donorName: job.donorName || `Donor for ${job.orderId}`,
        donorAddress: job.donorAddress || "Address unavailable",
        recipientName: job.recipientName || `Recipient for ${job.orderId}`,
        recipientAddress: job.recipientAddress || "Address unavailable",
        foodItems: job.foodItems && job.foodItems.length ? job.foodItems : ["Food items from order"],
        distance: job.distance || "N/A",
        estimatedTime: job.estimatedTime || "N/A",
        servings: job.servings ?? 0,
        urgency: job.urgency || "medium"
      }));
      
      const activeJobs = mappedJobs.filter(job => 
        job.status !== 'DELIVERED' && 
        job.status !== 'FAILED' && 
        job.status !== 'CANCELLED' && 
        job.status !== 'RETURNED'
      );
      const enrichedMyJobs = await enrichJobsBatch(activeJobs);
      setMyJobs(enrichedMyJobs);
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      toast.error('Failed to load your jobs.');
      setMyJobs([]);
    }
  };

  // Check if we should switch to "my-jobs" tab from navigation state
  useEffect(() => {
    if (location.state?.activeTab === 'my-jobs') {
      setActiveTab('my-jobs');
    }
  }, [location.state]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAvailableJobs();
    fetchMyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Refresh data when tab switches
  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableJobs();
    } else if (activeTab === 'my-jobs') {
      fetchMyJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAcceptJob = async (jobId) => {
    if (myJobs.length > 0) {
      toast.error("You can only have one active job at a time", {
        duration: 4000,
      });
      return;
    }

    const job = availableJobs.find((j) => j.id === jobId);
    if (!job) {
      toast.error("Job not found", { duration: 4000 });
      return;
    }

    try {
      setLoadingAccept(true);
      const courierId = getCourierId();
      if (!courierId) {
        toast.error("Unable to determine courier ID. Please sign in again.", {
          duration: 4000,
        });
        return;
      }
      
      await assignCourierToJob(jobId, courierId);

      try {
        await generatePodOtps(jobId);
      } catch (otpError) {
        console.warn('Failed to generate OTPs, but job was assigned successfully', otpError);
      }

      const acceptedJob = {
        ...job,
        courierId: courierId,
        assigned_at: new Date().toISOString(),
        status: 'ASSIGNED',
      };
      
      const enrichedAcceptedJob = await enrichJobWithAddresses(acceptedJob);
      setMyJobs([enrichedAcceptedJob]);
      setAvailableJobs((prev) => prev.filter((j) => j.id !== jobId));
      
      await fetchAvailableJobs();
      
      setTimeout(() => {
        setActiveTab("my-jobs");
      }, 300);
      
      toast.success("Job accepted! OTPs generated. Get ready for pickup.", {
        duration: 4000,
      });
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error(`Failed to accept job: ${error.message}`, {
        duration: 4000,
      });
    } finally {
      setLoadingAccept(false);
    }
  };

  const handleConfirmPickup = (jobId) => {
    const job = myJobs.find((j) => j.id === jobId);
    if (job) {
      // Call POD component via callback if provided, otherwise navigate
      if (onShowPOD) {
        onShowPOD(job, 'pickup');
      } else {
        navigate('/courier-verification', { state: { jobData: job, verificationType: 'pickup' } });
      }
    }
  };

  const handleConfirmDelivery = (jobId) => {
    const job = myJobs.find((j) => j.id === jobId);
    if (job) {
      // Call POD component via callback if provided, otherwise navigate
      if (onShowPOD) {
        onShowPOD(job, 'delivery');
      } else {
        navigate('/courier-verification', { state: { jobData: job, verificationType: 'delivery' } });
      }
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

  const handleConfirmCancel = async (reason) => {
    const job = myJobs.find((j) => j.id === cancelDialog.jobId);
    if (!job) {
      toast.error("Job not found", { duration: 4000 });
      return;
    }

    try {
      await unassignCourierFromJob(cancelDialog.jobId);

      try {
        await deletePodsForJob(cancelDialog.jobId);
      } catch (podError) {
        console.warn('Failed to delete POD records, but job cancellation succeeded', podError);
      }

      setMyJobs([]);
      setCancelDialog({ open: false, jobId: "", jobName: "" });
      
      await fetchAvailableJobs();
      
      setTimeout(() => {
        setActiveTab("available");
      }, 500);
      
      toast.success("Job cancelled successfully. It's now available for other couriers.", {
        duration: 4000,
      });
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast.error(`Failed to cancel job: ${error.message}`, {
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

  // Helper function to split each job into pickup and delivery jobs
  const splitJobIntoTwo = (job) => {
    // Determine pickup and delivery status based on job status
    const isPickupCompleted = job.status === 'PICKED_UP' || job.status === 'IN_TRANSIT' || 
                              job.status === 'OUT_FOR_DELIVERY' || job.status === 'DELIVERED';
    const isDeliveryCompleted = job.status === 'DELIVERED';
    
    const pickupJob = {
      ...job,
      jobType: 'pickup',
      displayId: `${job.id}-PICKUP`,
      locationName: job.donorName,
      locationAddress: job.donorAddress,
      status: isPickupCompleted ? "completed" : "pending",
      jobStatus: isPickupCompleted ? "completed" : "pending"
    };

    const deliveryJob = {
      ...job,
      jobType: 'delivery',
      displayId: `${job.id}-DELIVERY`,
      locationName: job.recipientName,
      locationAddress: job.recipientAddress,
      status: isDeliveryCompleted ? "completed" : "pending",
      jobStatus: isDeliveryCompleted ? "completed" : "pending"
    };

    return [pickupJob, deliveryJob];
  };

  // Get status badge for pickup/delivery jobs
  const getJobStatusBadge = (status, jobType) => {
    const isPending = status === "pending";
    const isCompleted = status === "completed" || status === "verified";
    
    if (jobType === 'pickup') {
      if (isPending) return <Badge bg="warning" className="text-dark">Pickup Pending</Badge>;
      if (isCompleted) return <Badge bg="success">Pickup Completed</Badge>;
    } else {
      if (isPending) return <Badge bg="primary">Delivery Pending</Badge>;
      if (isCompleted) return <Badge bg="success">Delivery Completed</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Welcome Banner */}
      <div
        className="rounded-4 mb-4 p-4 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          minHeight: "200px",
        }}
      >
        {/* Background blur effect */}
        <div
          className="position-absolute top-0 end-0 opacity-10"
          style={{
            width: "300px",
            height: "300px",
            backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22%3EUber Eats%3C/text%3E%3C/svg%3E')",
            backgroundSize: "contain",
            filter: "blur(20px)",
          }}
        />

        {/* Volunteer Active Badge */}
        <div
          className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
          style={{ backgroundColor: "#2563eb", fontSize: "0.75rem", fontWeight: 600 }}
        >
          <i className="bi bi-heart-fill text-white"></i>
          <span className="text-white">Volunteer Active</span>
        </div>

        <div className="position-relative" style={{ zIndex: 1 }}>
          <h2 className="text-white fw-bold mb-2" style={{ fontSize: "2rem" }}>
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-white mb-1" style={{ fontSize: "1rem", opacity: 0.95 }}>
            Ready to rescue food and help the community?
          </p>
          <p className="text-white mb-0" style={{ fontSize: "0.875rem", opacity: 0.85 }}>
            Every delivery you make fights hunger and reduces food waste.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        {/* Meals Delivered */}
        <Col md={3} sm={6}>
          <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{ width: "48px", height: "48px", backgroundColor: "#dcfce7" }}
                >
                  <i className="bi bi-box-seam text-success" style={{ fontSize: "1.5rem" }}></i>
                </div>
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: "0.875rem" }}>
                    Meals Delivered
                  </div>
                  <div className="fw-bold" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {stats.mealsDelivered}
                  </div>
                </div>
              </div>
              <div className="text-success small fw-semibold">+45 this week</div>
            </Card.Body>
          </Card>
        </Col>

        {/* People Helped */}
        <Col md={3} sm={6}>
          <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{ width: "48px", height: "48px", backgroundColor: "#dbeafe" }}
                >
                  <i className="bi bi-people text-primary" style={{ fontSize: "1.5rem" }}></i>
                </div>
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: "0.875rem" }}>
                    People Helped
                  </div>
                  <div className="fw-bold" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {stats.peopleHelped}
                  </div>
                </div>
              </div>
              <div className="text-primary small fw-semibold">+12 this week</div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Rescues */}
        <Col md={3} sm={6}>
          <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{ width: "48px", height: "48px", backgroundColor: "#f3e8ff" }}
                >
                  <i className="bi bi-graph-up" style={{ fontSize: "1.5rem", color: "#9333ea" }}></i>
                </div>
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: "0.875rem" }}>
                    Total Rescues
                  </div>
                  <div className="fw-bold" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {stats.completed}
                  </div>
                </div>
              </div>
              <div className="small fw-semibold" style={{ color: "#9333ea" }}>Keep up the great work!</div>
            </Card.Body>
          </Card>
        </Col>

        {/* Impact Score */}
        <Col md={3} sm={6}>
          <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{ width: "48px", height: "48px", backgroundColor: "#fed7aa" }}
                >
                  <i className="bi bi-star-fill text-warning" style={{ fontSize: "1.5rem" }}></i>
                </div>
                <div>
                  <div className="text-muted small mb-1" style={{ fontSize: "0.875rem" }}>
                    Impact Score
                  </div>
                  <div className="fw-bold" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {stats.rating}
                  </div>
                </div>
              </div>
              <div className="text-warning small fw-semibold">Outstanding volunteer!</div>
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
            <i className="bi bi-graph-up me-2" style={{ fontSize: '1rem' }}></i>
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
            <i className="bi bi-geo-alt-fill me-2" style={{ fontSize: '1rem' }}></i>
            My Jobs ({myJobs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "available" && (
            <div>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" style={{ color: '#10b981' }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p style={{ color: '#6b7280', marginTop: '16px' }}>Loading available jobs...</p>
                </div>
              ) : myJobs.length > 0 ? (
                <div className="text-center py-5">
                  <div className="position-relative d-inline-block mb-3">
                    <i className="bi bi-box-seam" style={{ fontSize: '4rem', color: '#86efac' }}></i>
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
                  <i className="bi bi-box-seam" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '16px' }}></i>
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
                              <i className="bi bi-briefcase" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                              <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                Job ID:
                              </small>
                              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.id}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-cart" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                              <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                Order ID:
                              </small>
                              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.orderId}</span>
                            </div>
                          </div>
                          <Badge bg="info">Available</Badge>
                        </div>

                        {/* Section 2: Pickup Location */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <i className="bi bi-shop" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Pickup From
                                </small>
                              </div>
                              <h6 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                {job.donorName}
                              </h6>
                              <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                <i className="bi bi-geo-alt me-1" style={{ color: '#ef4444' }}></i>
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
                            <i className="bi bi-arrow-right mt-1" style={{ color: '#10b981', fontSize: '1rem' }}></i>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <i className="bi bi-house" style={{ fontSize: '0.875rem', color: '#10b981' }}></i>
                                <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Deliver To
                                </small>
                              </div>
                              <h6 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                {job.recipientName}
                              </h6>
                              <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                <i className="bi bi-geo-alt me-1" style={{ color: '#10b981' }}></i>
                                {job.recipientAddress}
                              </small>
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Delivery Details Grid */}
                        <div className="mb-4">
                          <small className="d-block mb-3" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <i className="bi bi-info-circle me-1"></i>
                            Delivery Details
                          </small>
                          <Row className="g-3">
                            <Col xs={4}>
                              <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                  {job.distance}
                                </div>
                                <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                  <i className="bi bi-signpost me-1"></i>
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
                                  <i className="bi bi-clock me-1"></i>
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
                                  <i className="bi bi-people me-1"></i>
                                  Servings
                                </small>
                              </div>
                            </Col>
                          </Row>
                        </div>

                        {/* Section 5: Items */}
                        <div className="mb-4">
                          <small className="d-block mb-2" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <i className="bi bi-box-seam me-1"></i>
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
                          {job.notes && (
                            <div>
                              <div className="d-flex align-items-start gap-2">
                                <i className="bi bi-sticky me-1 mt-1" style={{ fontSize: '0.875rem', color: '#f59e0b' }}></i>
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
                          disabled={loadingAccept}
                        >
                          {loadingAccept ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Accepting...
                            </>
                          ) : (
                            'Accept Job'
                          )}
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
                  <i className="bi bi-geo-alt" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '16px' }}></i>
                  <p style={{ color: '#6b7280' }}>No active jobs</p>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '8px' }}>Accept a job from available jobs to get started!</p>
                </div>
              ) : (
                <div>
                  {(() => {
                    // Show only the first job (should be only one)
                    const job = myJobs[0];
                    const [pickupJob, deliveryJob] = splitJobIntoTwo(job);
                    return (
                      <Card key={job.id} className="mb-4" style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}>
                        <Card.Body className="p-4">
                          {/* Job Header */}
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4" style={{ 
                            paddingBottom: '16px',
                            borderBottom: '2px solid #e5e7eb'
                          }}>
                            <div className="d-flex flex-wrap align-items-center gap-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-briefcase" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                                <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                  Job ID:
                                </small>
                                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.id}</span>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-cart" style={{ fontSize: '0.875rem', color: '#6b7280' }}></i>
                                <small style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                                  Order ID:
                                </small>
                                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>{job.orderId}</span>
                              </div>
                            </div>
                            {getUrgencyBadge(job.urgency)}
                          </div>

                          {/* Pickup Section */}
                          <div className="mb-4" style={{
                            padding: '20px',
                            background: '#fef2f2',
                            borderRadius: '12px',
                            borderLeft: '4px solid #ef4444'
                          }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-shop" style={{ fontSize: '1rem', color: '#ef4444' }}></i>
                                <h5 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                  Pickup Section
                                </h5>
                              </div>
                              {getJobStatusBadge(pickupJob.jobStatus, 'pickup')}
                            </div>
                            <div className="mb-3">
                              <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Donor Name
                              </small>
                              <h6 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px', marginTop: '4px' }}>
                                {job.donorName || 'N/A'}
                              </h6>
                              <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Pickup Address
                              </small>
                              <small style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                <i className="bi bi-geo-alt me-1" style={{ color: '#ef4444' }}></i>
                                {job.donorAddress || 'Address not available'}
                              </small>
                            </div>
                            {(pickupJob.jobStatus === "pending" || !pickupJob.jobStatus) && (
                              <Button
                                className="w-100"
                                style={{
                                  background: '#ef4444',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}
                                onClick={() => handleConfirmPickup(pickupJob.id)}
                              >
                                <i className="bi bi-check-circle me-2"></i>
                                Confirm Pickup
                              </Button>
                            )}
                            {(pickupJob.jobStatus === "completed" || pickupJob.jobStatus === "verified") && (
                              <div className="text-center p-2" style={{
                                background: '#d1fae5',
                                borderRadius: '8px',
                                color: '#065f46',
                                fontWeight: '600'
                              }}>
                                <i className="bi bi-check-circle me-2"></i>
                                Pickup Completed
                              </div>
                            )}
                          </div>

                          {/* Delivery Section */}
                          <div className="mb-4" style={{
                            padding: '20px',
                            background: '#f0fdf4',
                            borderRadius: '12px',
                            borderLeft: '4px solid #10b981'
                          }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-house" style={{ fontSize: '1rem', color: '#10b981' }}></i>
                                <h5 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                                  Delivery Section
                                </h5>
                              </div>
                              {getJobStatusBadge(deliveryJob.jobStatus, 'delivery')}
                            </div>
                            <div className="mb-3">
                              <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Receiver Name
                              </small>
                              <h6 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px', marginTop: '4px' }}>
                                {job.recipientName || 'N/A'}
                              </h6>
                              <small style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Delivery Address
                              </small>
                              <small style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                <i className="bi bi-geo-alt me-1" style={{ color: '#10b981' }}></i>
                                {job.recipientAddress || 'Address not available'}
                              </small>
                            </div>
                            {(deliveryJob.jobStatus === "pending" || !deliveryJob.jobStatus) && (
                              <Button
                                className="w-100"
                                style={{
                                  background: '#10b981',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}
                                onClick={() => handleConfirmDelivery(deliveryJob.id)}
                              >
                                <i className="bi bi-check-circle me-2"></i>
                                Confirm Delivery
                              </Button>
                            )}
                            {(deliveryJob.jobStatus === "completed" || deliveryJob.jobStatus === "verified") && (
                              <div className="text-center p-2" style={{
                                background: '#d1fae5',
                                borderRadius: '8px',
                                color: '#065f46',
                                fontWeight: '600'
                              }}>
                                <i className="bi bi-check-circle me-2"></i>
                                Delivery Completed
                              </div>
                            )}
                          </div>

                          {/* Job Details */}
                          <div className="mb-4">
                            <small className="d-block mb-3" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <i className="bi bi-info-circle me-1"></i>
                              Job Details
                            </small>
                            <Row className="g-3">
                              <Col xs={4}>
                                <div className="text-center p-2" style={{ background: '#f9fafb', borderRadius: '6px' }}>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                    {job.distance}
                                  </div>
                                  <small style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                    <i className="bi bi-signpost me-1"></i>
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
                                    <i className="bi bi-clock me-1"></i>
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
                                    <i className="bi bi-people me-1"></i>
                                    Servings
                                  </small>
                                </div>
                              </Col>
                            </Row>
                          </div>

                          {/* Food Items */}
                          <div className="mb-4">
                            <small className="d-block mb-2" style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <i className="bi bi-box-seam me-1"></i>
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

                          {/* Notes */}
                          {job.notes && (
                            <div className="mb-4" style={{ 
                              padding: '12px',
                              background: '#f9fafb',
                              borderRadius: '8px'
                            }}>
                              <div className="d-flex align-items-start gap-2">
                                <i className="bi bi-sticky me-1 mt-1" style={{ fontSize: '0.875rem', color: '#f59e0b' }}></i>
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

                          {/* Cancel Job Button */}
                          <Button
                            variant="outline-secondary"
                            className="w-100"
                            style={{
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              padding: '10px'
                            }}
                            onClick={() => handleCancelJob(job.id)}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel Job
                          </Button>
                        </Card.Body>
                      </Card>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
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
