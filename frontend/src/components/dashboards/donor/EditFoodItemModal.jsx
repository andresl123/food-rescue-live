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
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-light border-0 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Edit Food Item</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleEditFoodItemSubmit}>
            <div className="modal-body">

              {/* Item Name */}
              <div className="mb-3">
                <label className="form-label text-secondary">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div className="mb-3">
                <label className="form-label text-secondary">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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
              <div className="mb-3">
                <label className="form-label text-secondary">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <label className="form-label text-secondary">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              {/* Unit Dropdown */}
              <div className="mb-3">
                <label className="form-label text-secondary">Unit of Measure</label>
                <select
                  className="form-select"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="KG">KG</option>
                  <option value="PCS">PCS</option>
                  <option value="Litre">Litre</option>
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
