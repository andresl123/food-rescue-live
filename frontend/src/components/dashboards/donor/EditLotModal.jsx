import React, { useState, useEffect } from "react";
import { updateLot } from "../../../services/lotService";
import { Status } from "../../../assets/statusValues";
import toast from "react-hot-toast";

export default function EditLotModal({ show, lot, onClose, onLotUpdated }) {
  const [formData, setFormData] = useState({
    description: "",
    status: "OPEN",
    category: "",
    tags: [],
  });

  // same options as in create modal
  const CATEGORY_OPTIONS = [
    { value: "produce", label: "Produce" },
    { value: "dairy", label: "Dairy" },
    { value: "bakery", label: "Bakery" },
    { value: "meat", label: "Meat" },
    { value: "frozen", label: "Frozen" },
    { value: "other", label: "Other" },
  ];

  const TAG_OPTIONS = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "glutenFree", label: "Gluten Free" },
    { value: "organic", label: "Organic" },
    { value: "perishable", label: "Perishable" },
    { value: "refrigerated", label: "Refrigerated" },
  ];

  // normalize backend enum-like values to our lower-case UI values
  const normalize = (v) => (typeof v === "string" ? v.trim() : v);
  const toUiValue = (v) => {
    if (!v) return "";
    // convert e.g. "DAIRY" -> "dairy", "GLUTEN_FREE" -> "glutenFree"
    const lower = v.toLowerCase();
    if (lower.includes("_")) {
      const parts = lower.split("_");
      return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    }
    return lower;
  };

  useEffect(() => {
    if (lot) {
      setFormData({
        description: lot.description || "",
        status: lot.status || "OPEN",
        category: toUiValue(lot.category) || "other",
        tags: Array.isArray(lot.tags) ? lot.tags.map((t) => toUiValue(t)) : [],
      });
    }
  }, [lot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryClick = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleTagToggle = (value) => {
    setFormData((prev) => {
      const already = prev.tags.includes(value);
      if (already) {
        return { ...prev, tags: prev.tags.filter((t) => t !== value) };
      }
      if (prev.tags.length >= 3) {
        toast.error("You can select up to 3 tags only.");
        return prev;
      }
      return { ...prev, tags: [...prev.tags, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    try {
      // send only what your backend accepts — we now include category + tags
      const payload = {
        description: formData.description,
        status: formData.status,
        category: formData.category || "other",
        tags: formData.tags || [],
      };

      const res = await updateLot(lot.lotId, payload);
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
                      {status.charAt(0) +
                        status
                          .slice(1)
                          .toLowerCase()
                          .replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Category pills */}
              <div className="mb-3">
                <label
                  className="form-label fw-semibold text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Category
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const active = formData.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryClick(cat.value)}
                        className={`btn btn-sm ${active ? "btn-dark" : "btn-light"}`}
                        style={{
                          borderRadius: "9999px",
                          border: active ? "1px solid #000" : "1px solid #e5e7eb",
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ✅ Tags pills (max 3) */}
              <div className="mb-3">
                <label
                  className="form-label fw-semibold text-secondary d-flex justify-content-between"
                  style={{ fontSize: "0.9rem" }}
                >
                  <span>Tags (max 3)</span>
                  <small className="text-muted">{formData.tags.length}/3 selected</small>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((tag) => {
                    const active = formData.tags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => handleTagToggle(tag.value)}
                        className={`btn btn-sm ${active ? "btn-outline-dark" : "btn-light"}`}
                        style={{
                          borderRadius: "9999px",
                          backgroundColor: active ? "#fff" : "#f9fafb",
                          border: active ? "1px solid #000" : "1px solid #e5e7eb",
                          color: active ? "#000" : "#374151",
                        }}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
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
