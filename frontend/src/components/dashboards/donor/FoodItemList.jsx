import React, { useState, useEffect } from "react";
import { getLots, getFoodItemsByLot } from "../../../services/lotService";
import toast from "react-hot-toast";
import FoodItemDetailModal from "./FoodItemDetailModal";
import EditFoodItemModal from "./EditFoodItemModal";
import UserLayout from "../../../layout/UserLayout"; // adjust path if needed

export default function FoodItemsList() {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await getLots();
        if (response?.success) {
          setLots(response.data);
        } else {
          toast.error(response?.message || "Failed to load lots.");
        }
      } catch (error) {
        console.error("Error fetching lots:", error);
        toast.error("Error loading lots.");
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, []);

  useEffect(() => {
    if (!selectedLot) return;
    const fetchItems = async () => {
      try {
        const response = await getFoodItemsByLot(selectedLot);
        if (response.success) {
          setFoodItems(response.data);
          setFilteredItems(response.data);
        } else {
          toast.error(response.message || "Failed to fetch food items.");
        }
      } catch (error) {
        console.error("Error fetching food items:", error);
        toast.error("Error loading food items.");
      }
    };
    fetchItems();
  }, [selectedLot]);

  useEffect(() => {
    const filtered = foodItems.filter((item) =>
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, foodItems]);

  const handleItemUpdated = () => {
    if (selectedLot) {
      setSelectedItem(null);
      setEditItem(null);
      getFoodItemsByLot(selectedLot).then((res) => {
        if (res.success) {
          setFoodItems(res.data);
          setFilteredItems(res.data);
        }
      });
    }
  };

  return (
    <UserLayout>
      {loading ? (
        <div className="text-center mt-5 text-secondary">
          <div className="spinner-border text-dark" role="status"></div>
          <p className="mt-2">Loading lots...</p>
        </div>
      ) : (
        <div className="container-fluid px-4 py-4">
          {/* ---------- HEADER ---------- */}
          <div className="d-flex align-items-center mb-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 me-3"
              style={{
                background: "#e5e7eb", // light grey
                width: "48px",
                height: "48px",
              }}
            >
              <i
                className="bi bi-gear" // more neutral icon
                style={{ fontSize: "1.5rem", color: "#111827" }} // dark
              ></i>
            </div>
            <div>
              <h2 className="fw-bold mb-1" style={{ color: "#111827" }}>
                Food Inventory
              </h2>
              <p className="mb-0 text-secondary">
                Manage and track your food items
              </p>
            </div>
          </div>

          {/* ---------- LOT SELECT ---------- */}
          <div className="bg-white shadow-sm rounded-4 p-4 mb-4 position-relative">
            <label className="fw-semibold text-secondary mb-2">
              Select Lot
            </label>
            <div style={{ position: "relative" }}>
              <select
                className="form-select"
                value={selectedLot}
                onChange={(e) => setSelectedLot(e.target.value)}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.95rem",
                  backgroundColor: "#fff",
                  color: "#111827",
                  fontWeight: 500,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  paddingRight: "40px",
                  cursor: "pointer",
                }}
              >
                <option value="">Choose a lot to view food items</option>
                {lots.map((lot) => (
                  <option key={lot.lotId} value={lot.lotId}>
                    {lot.description || "Unnamed Lot"}
                  </option>
                ))}
              </select>

              <i
                className="bi bi-chevron-down"
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  pointerEvents: "none",
                  fontSize: "0.9rem",
                }}
              ></i>
            </div>
          </div>

          {/* ---------- NO LOT SELECTED ---------- */}
          {!selectedLot && (
            <div className="text-center bg-white shadow-sm rounded-4 p-5 text-secondary">
              <i
                className="bi bi-box-seam mb-3"
                style={{ fontSize: "3rem", color: "#d1d5db" }}
              ></i>
              <h5 className="fw-semibold mb-1" style={{ color: "#111827" }}>
                No Lot Selected
              </h5>
              <p className="mb-0">Please select a lot to see the food items</p>
            </div>
          )}

          {/* ---------- LOT SELECTED ---------- */}
          {selectedLot && (
            <>
              {/* Search */}
              <div className="bg-white shadow-sm rounded-4 p-3 mb-3 d-flex align-items-center justify-content-between">
                <div className="position-relative flex-grow-1 me-3">
                  <i
                    className="bi bi-search position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: "14px" }}
                  ></i>
                  <input
                    type="text"
                    placeholder="Search food items..."
                    className="form-control ps-5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "10px",
                      height: "46px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </div>
              </div>

              {/* Food items list */}
              {filteredItems.map((item) => (
                <div
                  key={item.itemId}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-4 mb-3 d-flex justify-content-between align-items-center"
                  style={{
                    padding: "20px 26px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "#111827"; // dark, not purple
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  {/* Grid Layout for Item Info */}
                  <div
                    className="flex-grow-1"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr 1fr 0.7fr 0.8fr",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    {/* Item Name */}
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-4"
                        style={{
                          background: "#f3f4f6", // very light grey
                          width: "48px",
                          height: "48px",
                        }}
                      >
                        <i
                          className="bi bi-box"
                          style={{ color: "#111827", fontSize: "1.4rem" }} // dark icon
                        ></i>
                      </div>
                      <div>
                        <div
                          className="fw-semibold"
                          style={{ color: "#111827", fontSize: "1rem" }}
                        >
                          {item.itemName}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="d-flex flex-column">
                      <small className="text-secondary mb-1">Category</small>
                      <span
                        className="px-2 py-1 rounded-3"
                        style={{
                          background: "#e5e7eb", // neutral
                          color: "#374151",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          display: "inline-block",
                          width: "fit-content",
                        }}
                      >
                        {item.category || "—"}
                      </span>
                    </div>

                    {/* Expiry Date */}
                    <div className="d-flex flex-column">
                      <small className="text-secondary mb-1">Expiry Date</small>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {item.expiryDate?.split("T")[0] || "—"}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="d-flex flex-column">
                      <small className="text-secondary mb-1"># Quantity</small>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {item.quantity ?? "—"}
                      </span>
                    </div>

                    {/* Unit */}
                    <div className="d-flex flex-column">
                      <small className="text-secondary mb-1">Unit</small>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {item.unitOfMeasure || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    className="btn fw-semibold d-flex align-items-center justify-content-center"
                    style={{
                      border: "1px solid #111827",
                      borderRadius: "10px",
                      padding: "6px 16px",
                      fontSize: "0.9rem",
                      color: "#111827",
                      background: "white",
                      transition: "all 0.2s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditItem(item);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#111827";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.color = "#111827";
                    }}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ---------- MODALS ---------- */}
          {selectedItem && (
            <FoodItemDetailModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onEdit={() => {
                setEditItem(selectedItem);
                setSelectedItem(null);
              }}
            />
          )}

          {editItem && (
            <EditFoodItemModal
              show={true}
              lotId={selectedLot}
              foodItem={editItem}
              onClose={() => setEditItem(null)}
              onItemUpdated={handleItemUpdated}
            />
          )}
        </div>
      )}
    </UserLayout>
  );
}
