import React, { useState } from "react";
import { addFoodItem } from "../../../services/lotService";
import toast from "react-hot-toast";

export default function FoodItemModal({ show, onClose, lotId, onItemAdded }) {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    expiryDate: "",
    quantity: "",
    unitOfMeasure: "",
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
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5 className="fw-bold mb-3">Add Food Item</h5>

          <form onSubmit={handleSubmit}>
            {/* Item Name */}
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

            {/* Category Dropdown */}
            <div className="mb-3">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Category</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Grains & Bakery">Grains & Bakery</option>
                <option value="Packaged Foods">Packaged Foods</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div className="form-floating mb-3">
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-control"
                placeholder="Expiry Date"
                required
              />
              <label htmlFor="expiryDate">Expiry Date</label>
            </div>


            {/* Quantity and Unit */}
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
              <select
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Unit</option>
                <option value="kg">KG</option>
                <option value="pcs">PCS</option>
                <option value="litre">Litre</option>
              </select>
            </div>

            {/* Buttons */}
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
