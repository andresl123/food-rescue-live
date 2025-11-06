import React, { useState, useEffect } from "react";
import { updateFoodItem } from "../../../services/lotService";
import toast from "react-hot-toast";

export default function EditFoodItemModal({ show, lotId, foodItem, onClose, onItemUpdated }) {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    expiryDate: "",
    quantity: "",
    unitOfMeasure: "",
  });

  useEffect(() => {
    if (foodItem) {
      setFormData({
        itemName: foodItem.itemName || "",
        category: foodItem.category || "",
        expiryDate: foodItem.expiryDate ? foodItem.expiryDate.split("T")[0] : "",
        quantity: foodItem.quantity || 1,
        unitOfMeasure: foodItem.unitOfMeasure || "",
      });
    }
  }, [foodItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFoodItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateFoodItem(lotId, foodItem.itemId, formData);
      if (res.success) {
        toast.success("Food item updated successfully!");
        onItemUpdated(); // Refresh list
        onClose();
      } else {
        toast.error(res.message || "Failed to update item.");
      }
    } catch (error) {
      console.error("Update Food Item Error:", error);
      toast.error("Error updating food item.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-md" role="document">
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: "20px",
            backgroundColor: "#ffffff",
            color: "#111827",
          }}
        >
          {/* ---------- HEADER ---------- */}
          <div className="modal-header border-0 pb-0">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: "#111827" }}>
                Edit Food Item
              </h4>
              <p
                className="text-secondary mb-0"
                style={{ fontSize: "0.95rem", fontWeight: 400 }}
              >
                Make changes to the food item details below
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              style={{ filter: "invert(0.6)" }}
            ></button>
          </div>

          {/* ---------- FORM ---------- */}
          <form onSubmit={handleEditFoodItemSubmit}>
            <div className="modal-body pt-3">
              {/* Item Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "10px",
                    height: "46px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "10px",
                    height: "46px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
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
                <label className="form-label fw-semibold text-secondary">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  style={{
                    borderRadius: "10px",
                    height: "46px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Quantity + Unit */}
              <div className="d-flex gap-3">
                <div className="flex-grow-1">
                  <label className="form-label fw-semibold text-secondary">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    style={{
                      borderRadius: "10px",
                      height: "46px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div className="flex-grow-1">
                  <label className="form-label fw-semibold text-secondary">
                    Unit of Measure
                  </label>
                  <select
                    className="form-select"
                    name="unitOfMeasure"
                    value={formData.unitOfMeasure}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: "10px",
                      height: "46px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">Select Unit</option>
                    <option value="KG">KG</option>
                    <option value="PCS">PCS</option>
                    <option value="Litre">Litre</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ---------- FOOTER ---------- */}
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary fw-semibold"
                onClick={onClose}
                style={{
                  borderRadius: "10px",
                  padding: "8px 18px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn fw-semibold text-white"
                style={{
                  backgroundColor: "#111827",
                  borderRadius: "10px",
                  padding: "8px 18px",
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
