// src/components/dashboards/Courier/CompletedDeliveries.jsx
import React, { useState, useEffect, useRef } from "react";
import { Card, Badge, Spinner, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getCourierJobs,
  getOrderDetails,
  getAddress,
  getUserName,
  getLot,
} from "../../../services/courierService.jsx";
import { getUserProfile } from "../../../services/loginServices";
import UserLayout from "../../../layout/UserLayout";

export default function CompletedDeliveries() {
  const navigate = useNavigate();
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: "Courier",
    id: null,
  });

  const addressCacheRef = useRef({});
  const orderCacheRef = useRef({});
  const userCacheRef = useRef({});
  const lotCacheRef = useRef({});

  const formatAddress = (address) => {
    if (!address) {
      return "Address not available";
    }
    const { street, city, state, postalCode, country } = address;
    return [street, city, state, postalCode, country].filter(Boolean).join(", ");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "Invalid time";
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
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatOrderNumber = (orderId) => {
    if (!orderId) return "N/A";
    // Format as ORD-YYYY-XXXX if possible, otherwise use the orderId
    return `Order #${orderId}`;
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
      console.error("Error fetching order details:", error);
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
      console.error("Error fetching address:", error);
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
      console.error("Error fetching user name:", error);
      return null;
    }
  };

  const loadLotById = async (lotId) => {
    if (!lotId) return null;
    if (lotCacheRef.current[lotId]) {
      return lotCacheRef.current[lotId];
    }
    try {
      const lot = await getLot(lotId);
      if (lot) {
        lotCacheRef.current[lotId] = lot;
      }
      return lot;
    } catch (error) {
      console.error("Error fetching lot details:", error);
      return null;
    }
  };

  const enrichDelivery = async (job) => {
    if (!job?.orderId) {
      return job;
    }

    try {
      const orderDetails = await loadOrderDetails(job.orderId);
      if (!orderDetails) {
        return job;
      }

      const { pickupAddressId, deliveryAddressId, receiverId, lotId: orderLotId } = orderDetails;
      const [pickupAddress, deliveryAddress] = await Promise.all([
        loadAddressById(pickupAddressId),
        loadAddressById(deliveryAddressId),
      ]);

      const receiverName = receiverId ? await loadUserNameById(receiverId) : null;
      const lotId = orderLotId ?? job.lotId;
      const lotDetails = lotId ? await loadLotById(lotId) : null;

      return {
        ...job,
        pickupAddressId,
        deliveryAddressId,
        receiverId: receiverId ?? job.receiverId,
        donorAddress: pickupAddress ? formatAddress(pickupAddress) : job.donorAddress,
        recipientAddress: deliveryAddress ? formatAddress(deliveryAddress) : job.recipientAddress,
        recipientName: receiverName || job.recipientName || `Recipient for ${job.orderId}`,
        lotId,
        lotDetails,
      };
    } catch (error) {
      console.error("Failed to enrich delivery:", error);
      return job;
    }
  };

  // Initialize courier
  useEffect(() => {
    const initUserFromMe = async () => {
      try {
        const result = await getUserProfile();

        if (result.success && result.data) {
          setUser({
            name: result.data.name || result.data.email?.split("@")[0] || "Courier",
            id: result.data.userId,
          });

          if (result.data.userId) {
            localStorage.setItem("courierId", result.data.userId);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    initUserFromMe();
  }, []);

  // Fetch completed deliveries
  useEffect(() => {
    const fetchCompletedDeliveries = async () => {
      try {
        setLoading(true);
        const courierId = user.id || localStorage.getItem("courierId");
        if (!courierId) {
          setLoading(false);
          return;
        }

        const jobs = await getCourierJobs(courierId);
        
        // Filter for completed/delivered jobs
        const completedJobs = jobs.filter(
          (job) =>
            job.status === "DELIVERED" ||
            job.status === "delivered" ||
            job.completedAt != null
        );

        // Enrich jobs with addresses and names
        const enrichedDeliveries = await Promise.all(
          completedJobs.map(enrichDelivery)
        );

        // Sort by completion date (most recent first)
        enrichedDeliveries.sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
          return dateB - dateA;
        });

        setCompletedDeliveries(enrichedDeliveries);
        setFilteredDeliveries(enrichedDeliveries);
      } catch (error) {
        console.error("Error fetching completed deliveries:", error);
        toast.error("Failed to load completed deliveries.");
        setCompletedDeliveries([]);
        setFilteredDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchCompletedDeliveries();
    }
  }, [user.id]);

  // Filter deliveries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDeliveries(completedDeliveries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = completedDeliveries.filter((delivery) => {
      const recipientName = (delivery.recipientName || "").toLowerCase();
      const orderId = (delivery.orderId || "").toLowerCase();
      const address = (delivery.recipientAddress || "").toLowerCase();
      const jobId = (delivery.id || delivery.jobId || "").toLowerCase();

      return (
        recipientName.includes(query) ||
        orderId.includes(query) ||
        address.includes(query) ||
        jobId.includes(query)
      );
    });

    setFilteredDeliveries(filtered);
  }, [searchQuery, completedDeliveries]);

  return (
    <UserLayout>
      <div
        className="container-fluid py-4 px-4"
        style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}
      >
        {/* Header Section */}
        <div className="mb-4">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-link p-0 text-dark"
                style={{ fontSize: "1.5rem", textDecoration: "none" }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h2 className="fw-bold mb-1" style={{ color: "#111827", fontSize: "1.75rem" }}>
                  Completed Deliveries
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                  Track and manage your completed deliveries.
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#10b981",
                  color: "#fff",
                }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <span className="fw-semibold" style={{ color: "#10b981", fontSize: "0.95rem" }}>
                All Deliveries Complete
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute"
                style={{
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "1rem",
                }}
              ></i>
              <Form.Control
                type="text"
                placeholder="Search by customer name, order number, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: "48px",
                  paddingRight: "16px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" style={{ color: "#10b981" }}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p style={{ color: "#6b7280", marginTop: "16px" }}>
              Loading completed deliveries...
            </p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#f3f4f6",
                color: "#9ca3af",
              }}
            >
              <i className="bi bi-inbox" style={{ fontSize: "2.5rem" }}></i>
            </div>
            <h5 style={{ color: "#374151", marginBottom: "8px" }}>
              {searchQuery ? "No matching deliveries found" : "No Completed Deliveries Yet"}
            </h5>
            <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Complete your first delivery to see it here!"}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredDeliveries.map((delivery) => (
              <Card
                key={delivery.id || delivery.jobId}
                className="border-0 shadow-sm"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    {/* Left Section */}
                    <div className="flex-grow-1">
                      {/* Customer Name with Badge */}
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h5 className="mb-0 fw-bold" style={{ color: "#111827", fontSize: "1.1rem" }}>
                          {delivery.recipientName || "Recipient"}
                        </h5>
                        <Badge
                          bg="success"
                          className="px-2 py-1"
                          style={{ fontSize: "0.75rem", fontWeight: "600" }}
                        >
                          Delivered
                        </Badge>
                      </div>

                      {/* Order Number */}
                      <div className="mb-2">
                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                          {formatOrderNumber(delivery.orderId)}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <i className="bi bi-geo-alt-fill text-danger mt-1" style={{ fontSize: "0.9rem" }}></i>
                        <span className="text-dark" style={{ fontSize: "0.9rem" }}>
                          {delivery.recipientAddress || "Address not available"}
                        </span>
                      </div>

                      {/* Delivery Notes (if available) */}
                      {delivery.notes && (
                        <div className="d-flex align-items-start gap-2">
                          <i className="bi bi-file-text text-secondary mt-1" style={{ fontSize: "0.9rem" }}></i>
                          <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                            {delivery.notes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Time, Date, Items */}
                    <div className="text-end" style={{ minWidth: "140px" }}>
                      {/* Time and Date */}
                      <div className="d-flex align-items-center justify-content-end gap-2 mb-2">
                        <i className="bi bi-clock text-secondary" style={{ fontSize: "0.9rem" }}></i>
                        <div>
                          <div className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
                            {formatTime(delivery.completedAt)}
                          </div>
                          <div className="text-muted small">
                            {formatDate(delivery.completedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Items Count */}
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <i className="bi bi-box-seam text-secondary" style={{ fontSize: "0.9rem" }}></i>
                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                          {delivery.servings || delivery.foodItems?.length || 0} items
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
