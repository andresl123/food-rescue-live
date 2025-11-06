import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { createLot, addFoodItem } from "../../../services/lotService";
import { createAddress } from "../../../services/addressService";
import { addAddressToUser } from "../../../services/loginServices";
import FoodItemModal from "./FoodItemModal";
import toast from "react-hot-toast";

export default function CreateLotModal({ show, onClose, onLotCreated }) {
  const [step, setStep] = useState(1);

  // ---------- Lot Info ----------
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ NEW: category + tags state
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // ---------- Food Items ----------
  const [items, setItems] = useState([]);
  const [showFoodItemModal, setShowFoodItemModal] = useState(false);

  // ---------- Addresses ----------
  const [addresses, setAddresses] = useState([]); // default + others
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    province: "",
    country: "",
    postalCode: "",
  });
  const [addingAddress, setAddingAddress] = useState(false);

  // options for category / tags (UI only)
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

  // toggle tag (max 3)
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        toast.error("You can select up to 3 tags only.");
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  // ---------- Fetch Addresses on Open ----------
  useEffect(() => {
    if (!show) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const { sub: userId } = jwtDecode(token);
    console.log("👤 Logged in user ID:", userId);

    (async () => {
      try {
        const userRes = await fetch(`http://localhost:8080/api/v1/users/${userId}`);
        const userData = await userRes.json();
        const user = userData.data || userData;

        let allAddresses = [];

        // fetch default address
        if (user.defaultAddressId) {
          const res = await fetch(`http://localhost:8080/api/v1/addresses/${user.defaultAddressId}`);
          const addrData = await res.json();
          if (addrData?.data) allAddresses.push({ ...addrData.data, isDefault: true });
        }

        // fetch other addresses
        if (Array.isArray(user.moreAddresses) && user.moreAddresses.length > 0) {
          const others = await Promise.all(
            user.moreAddresses.map(async (id) => {
              try {
                const res = await fetch(`http://localhost:8080/api/v1/addresses/${id}`);
                const data = await res.json();
                return data.data || null;
              } catch {
                return null;
              }
            })
          );
          allAddresses.push(...others.filter(Boolean));
        }

        setAddresses(allAddresses);
        setSelectedAddressId(allAddresses[0]?._id || allAddresses[0]?.id || null);
      } catch (err) {
        console.error("❌ Error fetching addresses:", err);
      }
    })();
  }, [show]);

  // ---------- Upload Image ----------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "foodrescue_lot_uploads");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/da8bvrcjg/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        setMessage("Image uploaded successfully!");
      } else setMessage("Upload failed");
    } catch (err) {
      setMessage("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // ---------- Add New Address ----------
  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.postalCode) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setAddingAddress(true);
      const created = await createAddress(newAddress);

      const token = localStorage.getItem("accessToken");
      const { sub: userId } = jwtDecode(token);

      await addAddressToUser(userId, created.id || created._id, false);

      // add to UI list below default
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created._id || created.id);

      setNewAddress({
        street: "",
        city: "",
        province: "",
        country: "",
        postalCode: "",
      });

      toast.success("New address added!");
    } catch (err) {
      toast.error("Failed to add address");
    } finally {
      setAddingAddress(false);
    }
  };

  // ---------- Create Lot ----------
  const handleCreateLot = async () => {
    if (!description.trim()) {
      toast.error("Please enter a lot title");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select an address");
      return;
    }

    setLoading(true);
    const lotData = {
      description,
      imageUrl: uploadedUrl || imageUrl || null,
      addressId: selectedAddressId, // ✅ include selected address
      category: category || "other",
      tags: selectedTags,
    };

    try {
      const res = await createLot(lotData);
      if (!res?.success) throw new Error(res?.message || "Failed to create lot");

      const lotId = res?.data?.lotId || res?.data?.id;
      if (items.length) await Promise.all(items.map((item) => addFoodItem(lotId, item)));

      toast.success("Lot and items created successfully!");
      onLotCreated?.();
      resetForm();
      setTimeout(() => onClose(), 400);
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reset ----------
  const resetForm = () => {
    setDescription("");
    setImageUrl("");
    setUploadedUrl("");
    setItems([]);
    setMessage("");
    setStep(1);
    setCategory("");
    setSelectedTags([]);
  };

  if (!show) return null;

  // ---------------- UI ----------------
  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        style={{ maxWidth: "550px", width: "90%" }}
      >
        <div className="modal-content" style={{ borderRadius: "14px", border: "1px solid #e5e7eb" }}>
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <h5 className="fw-bold mb-0">Create New Food Lot</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            {/* Tabs */}
            <div
              className="d-flex justify-content-between align-items-center mb-4"
              style={{
                backgroundColor: "#f5f5f6",
                borderRadius: "9999px",
                padding: "4px",
              }}
            >
              {[
                { id: 1, icon: "bi-info-circle", label: "Lot" },
                { id: 2, icon: "bi-geo-alt", label: "Pickup Address" },
                { id: 3, icon: "bi-basket2", label: "Items" },
              ].map((tab) => {
                const isActive = step === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setStep(tab.id)}
                    className="flex-fill text-center py-2 fw-medium"
                    style={{
                      cursor: "pointer",
                      borderRadius: "9999px",
                      backgroundColor: isActive ? "#fff" : "transparent",
                      color: isActive ? "#000" : "#6b7280",
                      boxShadow: isActive ? "0 0 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <i
                      className={`bi ${tab.icon} me-1`}
                      style={{
                        fontSize: "1rem",
                        opacity: isActive ? 1 : 0.7,
                        verticalAlign: "middle",
                      }}
                    ></i>
                    <span style={{ verticalAlign: "middle", fontSize: "0.95rem" }}>
                      {tab.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step 1: Lot Info */}
            {step === 1 && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Lot Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Fresh Organic Vegetables Bundle"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Upload Image</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                    {uploading && (
                      <div className="small text-muted mt-1 d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Or Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* ✅ NEW: Category */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Category</label>
                  <div className="d-flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const active = category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
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

                {/* ✅ NEW: Tags (max 3) */}
                <div className="mb-2">
                  <label className="form-label fw-semibold d-flex justify-content-between">
                    <span>Tags</span>
                    <small className="text-muted">{selectedTags.length}/3 selected</small>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => {
                      const active = selectedTags.includes(tag.value);
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

                {message && (
                  <div className="alert alert-light border mt-2 py-2 text-secondary">{message}</div>
                )}

                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-dark px-4" onClick={() => setStep(2)}>
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Address Selection */}
            {step === 2 && (
              <>
                <h6 className="fw-semibold mb-3">Select Pickup Address</h6>

                {addresses.length === 0 ? (
                  <div className="text-muted mb-3 fst-italic">No addresses found. Add one below.</div>
                ) : (
                  addresses.map((addr, idx) => (
                    <div
                      key={addr._id || addr.id || idx}
                      className={`p-3 border rounded mb-2 ${
                        selectedAddressId === (addr._id || addr.id) ? "bg-light border-dark" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedAddressId(addr._id || addr.id)}
                    >
                      <div className="d-flex align-items-start">
                        <input
                          type="radio"
                          className="form-check-input me-2 mt-1"
                          checked={selectedAddressId === (addr._id || addr.id)}
                          onChange={() => setSelectedAddressId(addr._id || addr.id)}
                        />
                        <div>
                          <div className="fw-semibold">
                            {addr.street}{" "}
                            {idx === 0 && addr.isDefault && (
                              <span className="badge text-bg-secondary ms-1">Default</span>
                            )}
                          </div>
                          <div className="text-muted">
                            {addr.city}, {addr.province} — {addr.country} • {addr.postalCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <hr />
                <h6 className="fw-semibold mb-2">Add New Address</h6>
                <div className="row">
                  {["street", "city", "province", "country", "postalCode"].map((f) => (
                    <div key={f} className="col-6 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                        value={newAddress[f]}
                        onChange={(e) => setNewAddress({ ...newAddress, [f]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-outline-dark w-100"
                  onClick={handleAddAddress}
                  disabled={addingAddress}
                >
                  {addingAddress ? "Adding..." : "Add Address"}
                </button>

                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-outline-dark me-2" onClick={() => setStep(1)}>
                    Previous
                  </button>
                  <button className="btn btn-dark" onClick={() => setStep(3)}>
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Items */}
            {step === 3 && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-semibold mb-0">Food Items</h6>
                  <button className="btn btn-outline-dark btn-sm" onClick={() => setShowFoodItemModal(true)}>
                    + Add Item
                  </button>
                </div>

                <div className="border p-3 rounded bg-light" style={{ maxHeight: "280px", overflowY: "auto" }}>
                  {items.length === 0 ? (
                    // 🧺 Empty state
                    <div
                      className="d-flex flex-column align-items-center justify-content-center text-center border rounded"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "40px 0",
                      }}
                    >
                      <i
                        className="bi bi-box"
                        style={{ fontSize: "2.2rem", color: "#6b7280", marginBottom: "10px" }}
                      ></i>
                      <h6 className="fw-semibold text-dark mb-1">No items added yet</h6>
                      <small className="text-muted">Add your first food item to continue</small>
                    </div>
                  ) : (
                    // 🧾 List of added items
                    <div className="d-flex flex-column gap-3">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center shadow-sm border rounded bg-white px-3 py-3"
                          style={{
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle"
                              style={{
                                backgroundColor: "#f4f4f5",
                                width: "42px",
                                height: "42px",
                              }}
                            >
                              <i className="bi bi-basket2-fill text-dark" style={{ fontSize: "1.1rem" }}></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{item.itemName}</div>
                              <small className="text-muted">
                                {item.quantity} {item.unitOfMeasure} • {item.category}
                              </small>
                            </div>
                          </div>
                          <div className="text-end">
                            <small className="text-muted">Exp: {item.expiryDate}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-outline-dark me-2" onClick={() => setStep(2)}>
                    Previous
                  </button>
                  <button className="btn btn-dark" onClick={handleCreateLot} disabled={loading}>
                    {loading ? "Creating..." : "Create Lot"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showFoodItemModal && (
        <FoodItemModal
          show={showFoodItemModal}
          onClose={() => setShowFoodItemModal(false)}
          onItemAdded={(item) => setItems((prev) => [...prev, item])}
          isLocalAdd
        />
      )}
    </div>
  );
}
