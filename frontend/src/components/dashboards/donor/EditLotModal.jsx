import React, { useState, useEffect } from "react";
import { updateLot } from "../../../services/lotService"; // you'll add this in lotService.js
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
        onLotUpdated(); // refresh lots in dashboard
        onClose();      // close modal
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
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-light border-0 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Edit Lot</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Description */}
              <div className="mb-3">
                <label className="form-label text-secondary">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter new description"
                  required
                />
              </div>

              {/* Status Dropdown */}
              <div className="mb-3">
                <label className="form-label text-secondary">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="OPEN">Open</option>
                  <option value="PENDING">Pending</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
