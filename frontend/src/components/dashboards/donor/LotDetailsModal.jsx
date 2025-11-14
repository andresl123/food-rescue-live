import React, { useEffect, useState } from "react";
import FoodItemModal from "./FoodItemModal";
import { getFoodItemsByLot } from "../../../services/lotService";
import { getAddressById } from "../../../services/addressService";
import { getPickupOtpDonor } from "../../../services/pickupOtpService";

export default function LotDetailsModal({ show, onClose, lot, onItemAdded }) {
  const [showFoodItemModal, setShowFoodItemModal] = useState(false);
  const [currentLot, setCurrentLot] = useState(lot); // keep local copy of lot
  const [address, setAddress] = useState(null);
  const [pickupOtp, setPickupOtp] = useState(null);


  const getEarliestExpiry = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    // extract valid dates
    const validDates = items
      .map((i) => new Date(i.expiryDate))
      .filter((d) => !isNaN(d));

    if (validDates.length === 0) return null;

    // earliest date
    const earliest = new Date(Math.min(...validDates));

    return earliest.toLocaleDateString();
  };

    useEffect(() => {
      const fetchOtp = async () => {
        console.log("➡️ fetchOtp() called");

        if (!currentLot?.lotId && !currentLot?.id) {
          return;
        }

        const lotId = currentLot.lotId || currentLot.id || currentLot._id;

        const isPending =
          currentLot.status === "PENDING" ||
          currentLot.status === "WAITING_FOR_PICKUP";

        if (isPending) {
          try {
            const response = await getPickupOtpDonor(lotId);
            console.log("✅ OTP API response:", response);

            setPickupOtp(response.pickupOtp);
          } catch (err) {
            console.error("🔥 Error fetching pickup OTP:", err);
            setPickupOtp(null);
          }
        } else {
          setPickupOtp(null);
        }
      };

      fetchOtp();
    }, [currentLot]);



    useEffect(() => {
      const fetchAddress = async () => {
        if (!currentLot?.addressId) return;
        try {
          const data = await getAddressById(currentLot.addressId);
          if (data) setAddress(data);
        } catch (err) {
          console.error("Error fetching lot address:", err);
        }
      };

      fetchAddress();
    }, [currentLot]);

    useEffect(() => {
      setPickupOtp(currentLot.pickupOtp || "------");
    }, [currentLot]);

  // ✅ Refresh food items when a new one is added
  const handleItemAdded = async () => {
    setShowFoodItemModal(false);
    try {
      const res = await getFoodItemsByLot(
        currentLot.lotId || currentLot.id || currentLot._id
      );
      if (res.success && Array.isArray(res.data)) {
        setCurrentLot((prev) => ({
          ...prev,
          items: res.data,
        }));
      }
    } catch (err) {
      console.error("Failed to refresh items after adding:", err);
    }
    onItemAdded?.(); // optional dashboard refresh
  };

  if (!show || !currentLot) return null;

  const totalQuantity =
    currentLot.items?.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0),
      0
    ) || 0;

  // helper to capitalize / title case category
  const formatCategory = (cat) => {
    if (!cat) return "Produce";
    // handle enums like "DAIRY"
    const normalized = cat.toString().replace(/_/g, " ").toLowerCase();
    return normalized
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  // helper to format tags CSV
  const tagsCsv =
    Array.isArray(currentLot.tags) && currentLot.tags.length > 0
      ? currentLot.tags
          .map((t) =>
            t
              .toString()
              .replace(/_/g, " ")
              .toLowerCase()
              .split(" ")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ")
          )
          .join(", ")
      : null;

  return (
    <>
      <div
        className="modal show fade d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          style={{ maxWidth: "760px", width: "95%" }}
        >
          <div
            className="modal-content"
            style={{
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            {/* ---------- HEADER ---------- */}
            <div
              className="modal-header border-0 d-flex justify-content-between align-items-start"
              style={{ paddingBottom: "0.25rem" }}
            >
              <h4
                className="fw-bold mb-0 text-dark"
                style={{ fontSize: "1.4rem", lineHeight: "1.2" }}
              >
                {currentLot.description || "Lot Title"}
              </h4>
              <button
                type="button"
                className="btn-close ms-2"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>

            {/* ---------- STATUS & META INFO ---------- */}
            <div className="px-4">
              {/* ---------- IMAGE + DETAILS ---------- */}
              <div className="d-flex flex-wrap align-items-start gap-3 mt-3">
                <div
                  className="rounded-4 overflow-hidden bg-light flex-shrink-0"
                  style={{ width: "230px", height: "160px" }}
                >
                  {currentLot.imageUrl ? (
                    <img
                      src={currentLot.imageUrl}
                      alt="Lot"
                      className="img-fluid h-100 w-100"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                      <i className="bi bi-image" style={{ fontSize: "2rem" }}></i>
                    </div>
                  )}
                </div>

                <div className="flex-grow-1">
                  {/* ✅ category capitalized */}
                  <h6 className="fw-semibold mb-1 text-dark">
                    {formatCategory(currentLot.category)}
                  </h6>
                  <p className="mb-1 text-muted small">
                    <i className="bi bi-geo-alt me-1"></i>
                    {address
                      ? `${address.street || ""}, ${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}`
                      : "Address not available"}
                  </p>

                  <p className="mb-0 text-muted small">
                    <i className="bi bi-calendar-event me-1"></i>
{/*                     Expires: {currentLot.expiry || "3d left"} */}
                        Expires: {getEarliestExpiry(currentLot.items) || "N/A"}
                  </p>
                  {/* ✅ tags CSV under expiry */}
                  {tagsCsv && (
                    <p className="mb-0 text-muted small mt-1">
                      <i className="bi bi-tags me-1"></i>
                      {tagsCsv}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- PICKUP OTP BLOCK ---------- */}
            <div className="px-4 mt-4">
              <div
                className="d-flex align-items-center justify-content-start p-3 rounded-3"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span className="text-dark fw-semibold me-3" style={{ fontSize: "1rem" }}>
                  Pickup OTP:
                </span>

                <span
                  className="px-4 py-2 rounded-3 fw-bold"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    fontSize: "1.25rem",
                    letterSpacing: "2px",
                  }}
                >
                  {pickupOtp ?? "----"}
                </span>
              </div>
            </div>


            {/* ---------- FOOD ITEMS ---------- */}
            <hr className="my-4" />
            <div className="px-4 pb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="fw-semibold mb-0 text-dark">
                    Food Items{" "}
                    <span
                      className="badge bg-light text-dark ms-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {currentLot.items?.length || 0} items
                    </span>
                  </h6>
                  {/* + Add Item Button */}
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm ms-2"
                    onClick={() => setShowFoodItemModal(true)}
                  >
                    + Add Item
                  </button>
                </div>

                <small className="text-muted">
                  Total quantity: {totalQuantity} units
                </small>
              </div>

              <div
                className="border border-dashed rounded-3 p-3"
                style={{
                  border: "1px dashed #d1d5db",
                  backgroundColor: "#fafafa",
                  maxHeight: "270px",
                  overflowY: "auto",
                }}
              >
                {currentLot.items && currentLot.items.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {currentLot.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="d-flex justify-content-between align-items-center bg-white border p-3 rounded-3 shadow-sm"
                        style={{
                          transition: "background 0.2s ease",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ffffff")
                        }
                      >
                        <div>
                          <div
                            className="fw-semibold text-dark"
                            style={{ fontSize: "0.95rem" }}
                          >
                            {item.itemName}
                          </div>
                          <small className="text-muted">
                            {item.quantity} {item.unitOfMeasure} • {item.category}
                          </small>
                        </div>
                        <div>
                          <small
                            className="text-muted"
                            style={{
                              fontSize: "0.8rem",
                              fontStyle: "italic",
                            }}
                          >
                            Exp: {item.expiryDate}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center py-4 text-muted">
                    <i className="bi bi-box" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2 mb-0 fw-medium">No food items yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ---------- FOOTER ---------- */}
            <div
              className="modal-footer border-0 py-2 px-4"
              style={{
                backgroundColor: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <div className="d-flex align-items-center w-100 justify-content-between">
                <div className="text-muted small d-flex align-items-center">
                  <i className="bi bi-info-circle me-2"></i>
{/*                   Click <b> + Add Item </b>  to add food to this lot. */}
                Click <b>&nbsp;+ Add Item&nbsp;</b> to add food to this lot.
                </div>
                <button
                  className="btn btn-outline-dark btn-sm px-3 py-1"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ADD ITEM MODAL ---------- */}
      {showFoodItemModal && (
        <FoodItemModal
          show={showFoodItemModal}
          lotId={currentLot.lotId || currentLot.id || currentLot._id}
          onClose={() => setShowFoodItemModal(false)}
          onItemAdded={handleItemAdded} // ✅ refresh modal live
        />
      )}
    </>
  );
}
