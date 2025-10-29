import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function JobList({ jobs, onStartDelivery, onCancelJob }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { bg: "warning", text: "text-dark" };
      case "assigned":
        return { bg: "info", text: "text-dark" };
      case "in-progress":
        return { bg: "warning", text: "text-dark" };
      case "completed":
        return { bg: "success", text: "text-white" };
      default:
        return { bg: "secondary", text: "text-white" };
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-5">
        <h1 className="text-muted mb-3">💼</h1>
        <h5 className="text-muted">No assigned jobs</h5>
        <p className="text-muted">Go to "Available Orders" to claim one</p>
      </div>
    );
  }

  return (
    <div>
      {jobs.map((job) => (
        <Card key={job.id} className="mb-3" style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333',
          borderRadius: '12px'
        }}>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '1rem' }}>
                <i className="fas fa-briefcase me-2" style={{ color: '#34c759', fontSize: '0.9rem' }}></i>
                {job.id}
              </h6>
              <Badge bg={getStatusBadge(job.status).bg} className={getStatusBadge(job.status).text}>
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
            </Row>

            {job.status !== "completed" ? (
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
                  onClick={() => onStartDelivery(job.id)}
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
                  onClick={() => onCancelJob(job.id)}
                >
                  <i className="fas fa-times me-1" style={{ fontSize: '0.7rem' }}></i>
                  Cancel
                </Button>
              </div>
            ) : (
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
  );
}
