import React, { useState } from "react";
import { createLot } from "../../../services/lotService";

export default function CreateLotModal({ show, onClose, onLotCreated }) {
  const [description, setDescription] = useState("");
  const [totalItems, setTotalItems] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const lotData = {
      description,
      totalItems: parseInt(totalItems, 10)
    };

    const response = await createLot(lotData);

    if (response.success) {
      setMessage("Lot created successfully!");
      onLotCreated(); // refresh lots on dashboard
      setTimeout(() => {
        setDescription("");
        setTotalItems("");
        setMessage("");
        onClose(); // close modal
      }, 1000);
    } else {
      setMessage("Failed: " + response.message);
    }

    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">Create New Donation Lot</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 20 meal boxes, fresh fruits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Total Items</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 20"
                  value={totalItems}
                  onChange={(e) => setTotalItems(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className="alert alert-info py-2">{message}</div>
              )}

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Lot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
