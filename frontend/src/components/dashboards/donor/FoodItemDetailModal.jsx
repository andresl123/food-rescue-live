// src/components/dashboards/donor/FoodItemDetailModal.jsx
import React from "react";
import { Modal } from "react-bootstrap";

export default function FoodItemDetailModal({ item, onClose, onEdit }) {
  if (!item) return null;

  return (
    <Modal show={true} onHide={onClose} centered size="md">
      <Modal.Body
        style={{
          padding: "2rem",
          borderRadius: "20px",
        }}
      >
        {/* HEADER */}
        <h4 className="fw-bold mb-1" style={{ color: "#111827" }}>
          Food Item Details
        </h4>
        <p className="text-secondary mb-4" style={{ fontSize: "0.95rem" }}>
          View detailed information about this food item
        </p>

        {/* ITEM NAME */}
        <div
          className="d-flex align-items-center bg-light p-3 rounded-4 mb-3"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle me-3"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#eef2ff",
              color: "#6366f1",
            }}
          >
            <i className="bi bi-box" style={{ fontSize: "1.2rem" }}></i>
          </div>
          <div>
            <p className="mb-1 text-secondary fw-semibold small">Item Name</p>
            <h6 className="fw-semibold mb-0">{item.itemName}</h6>
          </div>
        </div>

        {/* CATEGORY */}
        <div
          className="d-flex align-items-center bg-light p-3 rounded-4 mb-3"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <i
            className="bi bi-tag-fill me-3"
            style={{ color: "#a855f7", fontSize: "1.2rem" }}
          ></i>
          <div>
            <p className="mb-1 text-secondary fw-semibold small">Category</p>
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: "#eef2ff",
                color: "#4f46e5",
                fontSize: "0.85rem",
              }}
            >
              {item.category}
            </span>
          </div>
        </div>

        {/* EXPIRY DATE */}
        <div
          className="d-flex align-items-center bg-light p-3 rounded-4 mb-3"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <i
            className="bi bi-calendar-event me-3"
            style={{ color: "#ef4444", fontSize: "1.2rem" }}
          ></i>
          <div>
            <p className="mb-1 text-secondary fw-semibold small">Expiry Date</p>
            <h6 className="fw-semibold mb-0">{item.expiryDate}</h6>
          </div>
        </div>

        {/* QUANTITY + UNIT */}
        <div className="d-flex gap-3">
          <div
            className="flex-grow-1 bg-light p-3 rounded-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-hash text-success"></i>
              <p className="mb-1 text-secondary fw-semibold small">Quantity</p>
            </div>
            <h6 className="fw-semibold mb-0">{item.quantity}</h6>
          </div>

          <div
            className="flex-grow-1 bg-light p-3 rounded-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-box text-primary"></i>
              <p className="mb-1 text-secondary fw-semibold small">Unit</p>
            </div>
            <h6 className="fw-semibold mb-0">{item.unitOfMeasure}</h6>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            style={{
              borderRadius: "10px",
              padding: "8px 18px",
            }}
          >
            Close
          </button>
          <button
            className="btn text-white"
            onClick={onEdit}
            style={{
              backgroundColor: "#111827",
              borderRadius: "10px",
              padding: "8px 18px",
            }}
          >
            Edit Item
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
