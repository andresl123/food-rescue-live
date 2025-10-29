import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function OrderList({ orders, onClaimOrder }) {
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-5">
        <h1 className="text-muted mb-3">📦</h1>
        <h5 className="text-muted">No orders available</h5>
        <p className="text-muted">Check back later for new delivery opportunities</p>
      </div>
    );
  }

  return (
    <div>
      {orders.map((order) => (
        <Card key={order.id} className="mb-3" style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333',
          borderRadius: '12px'
        }}>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '1rem' }}>
                <i className="fas fa-box me-2" style={{ color: '#007aff', fontSize: '0.9rem' }}></i>
                {order.id}
              </h6>
              <Badge bg={getStatusBadge(order.status).bg} className={getStatusBadge(order.status).text}>
                {order.status}
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
                    {order.pickupAddress}
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
                    {order.deliveryAddress}
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
                    {order.receiverName}
                  </span>
                </div>
              </Col>
            </Row>

            <Button
              className="w-100 fw-semibold py-2 mt-3"
              style={{ 
                background: '#007aff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
              onClick={() => onClaimOrder(order.id)}
            >
              Claim Delivery
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
