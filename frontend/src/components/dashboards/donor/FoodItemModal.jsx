import React, { useState } from "react";
import { addFoodItem } from "../../../services/lotService";
import toast from "react-hot-toast";

export default function FoodItemModal({ show, onClose, lotId, onItemAdded }) {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    expiryDate: "",
    quantity: 1,
    unitOfMeasure: "unit",
  });

  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await addFoodItem(lotId, formData);

    if (response.success) {
      toast.success("Item added successfully!");
      onItemAdded();
      onClose();
    } else {
      toast.error(response.message || "Failed to add item.");
    }

    setLoading(false);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5 className="fw-bold mb-3">Add Food Item</h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                name="itemName"
                placeholder="Item Name"
                value={formData.itemName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <input
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3 d-flex gap-3">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-control"
                placeholder="Quantity"
                min="1"
                required
              />
              <input
                name="unitOfMeasure"
                placeholder="Unit"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
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
                {loading ? "Adding..." : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
