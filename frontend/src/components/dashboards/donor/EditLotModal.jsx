import React, { useState, useEffect } from "react";
import { updateLot } from "../../../services/lotService";
import { Status } from "../../../assets/statusValues";
import toast from "react-hot-toast";

export default function EditLotModal({ show, lot, onClose, onLotUpdated }) {
  const [formData, setFormData] = useState({
    description: "",
    status: "OPEN",
  });

  useEffect(() => {
    if (lot) {
      setFormData({
        description: lot.description || "",
        status: lot.status || "OPEN",
      });
    }
  }, [lot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    try {
      const res = await updateLot(lot.lotId, formData);
      if (res.success) {
        toast.success("Lot updated successfully!");
        onLotUpdated();
        onClose();
      } else {
        toast.error(res.message || "Failed to update lot.");
      }
    } catch (error) {
      toast.error("Something went wrong while updating the lot.");
      console.error("UpdateLot Error:", error);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: "14px",
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          {/* ---------- HEADER ---------- */}
          <div
            className="modal-header border-0"
            style={{
              backgroundColor: "white",
              color: "black",
              padding: "1rem 1rem 0 1rem",
              borderColor: "#d1d5db",
            }}
          >
            <h5 className="modal-title fw-bold mb-0">Edit Lot</h5>
            <button
              type="button"
              className="btn-close btn-close-gray"
              onClick={onClose}
            ></button>
          </div>

          {/* ---------- FORM BODY ---------- */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ padding: "1rem 1rem 0 1rem" }}>
              {/* Description */}
              <div className="mb-4">
                <label
                  className="form-label fw-semibold text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Description
                </label>
                <input
                  type="text"
                  className="form-control shadow-sm"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter lot title"
                  required
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                    padding: "10px 12px",
                  }}
                />
              </div>

              {/* Status Dropdown */}
              <div className="mb-4">
                <label
                  className="form-label fw-semibold text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Status
                </label>
                <select
                  className="form-select shadow-sm"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                    padding: "10px 12px",
                  }}
                >
                  {Object.values(Status).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            {/* ---------- FOOTER ---------- */}
            <div
              className="modal-footer border-0 d-flex justify-content-end"
              style={{
                backgroundColor: "#f9fafb",
                padding: "1rem 1.5rem",
              }}
            >
              <button
                type="button"
                className="btn btn-outline-dark px-4"
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-dark ms-2 px-4"
                style={{
                  borderRadius: "8px",
                  fontWeight: 500,
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
