import React, { useEffect, useState } from "react";
import { getFoodItemsByLot, disableFoodItem } from "../../../services/lotService";
import EditFoodItemModal from "./EditFoodItemModal";
import toast from "react-hot-toast";

export default function FoodItemList({ lotId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // ------------------ Fetch Items ------------------
  const fetchItems = async () => {
    try {
      const res = await getFoodItemsByLot(lotId);
      if (res.success) setItems(res.data);
      else toast.error(res.message || "Failed to load food items");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching food items");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Disable Item ------------------
  const handleDisableFoodItem = async (item) => {
    try {
      const res = await disableFoodItem(item);
      if (res.success) {
        toast.success("Food item disabled");
        fetchItems();
      } else {
        toast.error(res.message || "Failed to disable food item");
      }
    } catch (err) {
      console.error("Disable Item Error:", err);
    }
  };

  // ------------------ Edit Item ------------------
  const handleEditFoodItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // ------------------ Load Data ------------------
  useEffect(() => {
    fetchItems();
  }, [lotId]);

  if (loading)
    return <div className="text-center text-secondary py-2">Loading items...</div>;

  return (
    <div className="p-2">
      <table className="table table-sm table-striped table-dark align-middle mb-0">
        <thead>
          <tr className="text-muted">
            <th>Item Name</th>
            <th>Category</th>
            <th>Expiry</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-secondary">
                No items in this lot.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item._id || index}>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>
                  {item.expiryDate
                    ? new Date(item.expiryDate).toLocaleDateString()
                    : "—"}
                </td>
                <td>{item.quantity}</td>
                <td>{item.unitOfMeasure}</td>
                <td>
                  <span
                    className={`badge bg-${
                      item.status?.toLowerCase() === "inactive"
                        ? "secondary"
                        : "success"
                    }`}
                  >
                    {item.status || "ACTIVE"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    disabled={item.status === "INACTIVE"}
                    onClick={() => handleEditFoodItem(item)}
                  >
                    ✏️ Edit
                  </button>

{/*                   <button */}
{/*                     className="btn btn-danger btn-sm" */}
{/*                     disabled={item.status === "INACTIVE"} */}
{/*                     onClick={() => handleDisableFoodItem(item)} */}
{/*                   > */}
{/*                     🚫 Disable */}
{/*                   </button> */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Edit Modal */}
      {showEditModal && (
        <EditFoodItemModal
          show={showEditModal}
          lotId={lotId}
          foodItem={selectedItem}
          onClose={() => setShowEditModal(false)}
          onItemUpdated={fetchItems}
        />
      )}
    </div>
  );
}
