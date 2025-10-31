import React, { useState } from "react";
import toast from "react-hot-toast";
import { addFoodItem } from "../../../services/lotService"; // still works if called after lot created

export default function FoodItemModal({
  show,
  onClose,
  lotId,
  onItemAdded,
  isLocalAdd = false // true = before lot creation, just add to list
}) {
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

    if (isLocalAdd) {
      // Case 1: Lot not yet created — add item locally
      onItemAdded(formData);
      toast.success("Item added!");
      setLoading(false);
      onClose();
      return;
    }

    // Case 2: Lot already exists — call backend
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
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div
          className="modal-content border-0 shadow-lg p-4"
          style={{
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            color: "#2b2b2b",
            border: "1px solid #e4e4e7",
          }}
        >
          <h5 className="fw-semibold mb-3" style={{ fontSize: "1.1rem" }}>
            Add Food Item
          </h5>

          <form onSubmit={handleSubmit}>
            {/* Item Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
                Item Name *
              </label>
              <input
                name="itemName"
                placeholder="e.g., Bananas, Bread, Milk"
                value={formData.itemName}
                onChange={handleChange}
                className="form-control"
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #dcdcdc",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Category Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #dcdcdc",
                  fontSize: "0.9rem",
                }}
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
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-control"
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #dcdcdc",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Quantity + Unit */}
            <div className="mb-3 d-flex gap-3">
              <div className="flex-fill">
                <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 10"
                  min="1"
                  required
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #dcdcdc",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
              <div className="flex-fill">
                <label className="form-label fw-semibold" style={{ fontSize: "0.9rem" }}>
                  Unit *
                </label>
                <select
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  className="form-select"
                  required
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #dcdcdc",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">Select Unit</option>
                  <option value="KG">KG</option>
                  <option value="PCS">PCS</option>
                  <option value="Litre">Litre</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-dark me-2"
                onClick={onClose}
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                  padding: "6px 20px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-dark"
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                  padding: "6px 24px",
                }}
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
