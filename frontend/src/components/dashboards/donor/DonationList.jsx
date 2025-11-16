import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import LotDetailsModal from "./LotDetailsModal";

export default function DonationList({ donations, onAddItem, onEditLot, onRefreshLots }) {
// export default function DonationList({ donations, onAddItem, onEditLot }) {
  const [selectedLot, setSelectedLot] = useState(null);
  const [addressMap, setAddressMap] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);

//     const handleLotUpdated = () => {
//       // REFETCH donations from parent
//       if (typeof onAddItem === "function") {
//         onAddItem(); // parent can re-fetch
//       }
//     };

const handleLotUpdated = () => {
    // Just refresh lots, don't open any modal
    if (typeof onRefreshLots === "function") {
      onRefreshLots();
    }
  };


//     const getEarliestExpiry = (items = []) => {
//       if (!Array.isArray(items) || items.length === 0) return null;
//
//       // extract valid dates
//       const validDates = items
//         .map((i) => new Date(i.expiryDate))
//         .filter((d) => !isNaN(d));
//
//       if (validDates.length === 0) return null;
//
//       // earliest date
//       const earliest = new Date(Math.min(...validDates));
//
//       return earliest.toLocaleDateString();
//     };

// const getEarliestExpiry = (items = []) => {
//   if (!Array.isArray(items) || items.length === 0) return null;
//
//   const validDates = items
//     .map((i) => i.expiryDate)
//     .filter(Boolean);
//
//   if (validDates.length === 0) return null;
//
//   // Find earliest date by comparing raw strings
//   const earliest = validDates.reduce((min, curr) =>
//     curr < min ? curr : min
//   );
//
//   // return raw unchanged string (no timezone conversion)
//   return earliest;
// };

const getEarliestExpiry = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  // Normalize dates (support expiryDate or expiry_date)
  const validDates = items
    .map((i) => i.expiryDate || i.expiry_date)
    .filter(Boolean);

  if (validDates.length === 0) return null;

  const today = new Date().setHours(0, 0, 0, 0);

  // Split into expired and non-expired
  const futureDates = [];
  const expiredDates = [];

  validDates.forEach(dateStr => {
    const d = new Date(dateStr).setHours(0, 0, 0, 0);
    if (d >= today) {
      futureDates.push(dateStr);
    } else {
      expiredDates.push(dateStr);
    }
  });

  // If there are future dates, return the earliest future one
  if (futureDates.length > 0) {
    return futureDates.reduce((min, curr) =>
      curr < min ? curr : min
    );
  }

  // All items expired — fallback to earliest expired date
  return expiredDates.reduce((min, curr) =>
    curr < min ? curr : min
  );
};



//   useEffect(() => {
//     const fetchAddresses = async () => {
//       const token = localStorage.getItem("accessToken");
//       if (!token || !donations?.length) return;
//
//       const newMap = {};
//       await Promise.all(
//         donations.map(async (lot) => {
//           if (lot.addressId && !addressMap[lot.addressId]) {
//             try {
//               const res = await fetch(`http://localhost:8080/api/v1/addresses/${lot.addressId}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//               const addrData = await res.json();
//               if (addrData?.data) newMap[lot.addressId] = addrData.data;
//             } catch (err) {
//               console.error("Error fetching address for lot:", lot.lotId, err);
//             }
//           }
//         })
//       );
//       setAddressMap((prev) => ({ ...prev, ...newMap }));
//     };
//
//     fetchAddresses();
//   }, [donations]);


  const handleViewDetails = (lot) => setSelectedLot(lot);

  const handleToggleDropdown = (lotId) => {
    setOpenDropdownId((prev) => (prev === lotId ? null : lotId)); // open one, close others
  };


  if (!donations || donations.length === 0) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center py-5 text-muted"
        style={{
          backgroundColor: "#fafafa",
          borderRadius: "12px",
          border: "1px dashed #d1d5db",
        }}
      >
        <i className="bi bi-box-seam mb-2" style={{ fontSize: "2rem" }}></i>
        <p className="mb-0 fw-semibold">No lots</p>
        <small>Create your first donation lot to get started</small>
      </div>
    );
  }



  return (
    <>
    <style>
      {`
        .dropdown-toggle::after {
          display: none !important;
          content: none !important;
        }

        /* Custom scrollbar for DonationList */
        .d-flex.flex-column.gap-3::-webkit-scrollbar {
          width: 6px;
        }
        .d-flex.flex-column.gap-3::-webkit-scrollbar-thumb {
          background-color: #d1d5db; /* light gray */
          border-radius: 4px;
        }
        .d-flex.flex-column.gap-3::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af; /* darker gray on hover */
        }
      `}
    </style>

      <div className="d-flex flex-column gap-3"
          style={{
              maxHeight: "460px", // ~4 cards tall (adjust if your cards are taller/shorter)
              overflowY: "auto",
              paddingRight: "6px",
              minHeight: "180px",
            }}
        >
        {donations.map((lot) => (
          <div
            key={lot.lotId}
            className="d-flex align-items-center justify-content-between shadow-sm p-3 bg-white rounded-4"
            style={{
              border: "1px solid #e5e7eb",
              transition: "all 0.2s ease-in-out",
              cursor: "pointer",
            }}
            onClick={() => handleViewDetails(lot)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            {/* Left Section */}
            <div className="d-flex align-items-center">
              <div
                className="rounded-3 me-3 overflow-hidden"
                style={{
                  width: "110px",
                  height: "110px",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {lot.imageUrl ? (
                  <img
                    src={lot.imageUrl}
                    alt={lot.description || "Lot"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <i
                    className="bi bi-image text-secondary"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                )}
              </div>

              <div>
                <h6 className="fw-semibold mb-1 text-dark">
                  {lot.description || "Untitled Lot"}
                </h6>

                {/* ✅ REPLACE THIS PART */}
                <div className="text-muted small d-flex flex-column gap-1 mt-1">
                  <div>
                    <i className="bi bi-box-seam me-2"></i>
                    {lot.totalItems || 0} items
                  </div>
                  <div>
                    <i className="bi bi-calendar3 me-2"></i>
{/*                     {new Date(lot.created_at || lot.createdAt).toLocaleDateString()} */}
                        Exp: <span style={{ fontStyle: "italic" }}>{getEarliestExpiry(lot.items) || "N/A"}</span>
                  </div>
                  {lot.addressId && addressMap[lot.addressId] && (
                    <div>
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      {`${addressMap[lot.addressId].street || ""}, ${addressMap[lot.addressId].city || ""}, ${addressMap[lot.addressId].state || ""} ${addressMap[lot.addressId].postalCode || ""}`}
                    </div>
                  )}
                </div>
                {/* ✅ END OF NEW SECTION */}

                <span
                  className={`badge rounded-pill mt-2 px-3 py-1 fw-semibold`}
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor:
                      lot.status?.toLowerCase() === "active"
                        ? "#dcfce7"
                        : lot.status?.toLowerCase() === "pending"
                        ? "#fff7ed"
                        : lot.status?.toLowerCase() === "expiring_soon"
                        ? "#f97316"
                        : lot.status?.toLowerCase() === "inactive"
                        ? "#000000"
                        : lot.status?.toLowerCase() === "delivered"
                        ? "#dbeafe"
                        : "#f3f4f6",
                    color:
                      lot.status?.toLowerCase() === "active"
                        ? "#166534"
                        : lot.status?.toLowerCase() === "pending"
                        ? "#b45309"
                        : lot.status?.toLowerCase() === "expiring_soon"
                        ? "#ffffff"
                        : lot.status?.toLowerCase() === "inactive"
                        ? "#ffffff"
                        : lot.status?.toLowerCase() === "delivered"
                        ? "#1e3a8a"
                        : "#6b7280",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {lot.status || "N/A"}
                </span>
              </div>

            </div>

            {/* Right Section (Total + Dropdown) */}
            <div
              className="d-flex align-items-center gap-3"
              onClick={(e) => e.stopPropagation()} // prevents modal open when using dropdown
            >
              <small className="text-muted">Total: {lot.totalItems || 0}</small>

              <Dropdown align="end"
                        show={openDropdownId === lot.lotId}
                        onToggle={() => handleToggleDropdown(lot.lotId)}
              >
                <Dropdown.Toggle
                  as="button"
                  className="btn btn-light border-0 rounded-circle p-2 dropdown-toggle-no-caret"
                  style={{ width: "38px", height: "38px" }}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
{/*                   <Dropdown.Item */}
{/*                     onClick={() => onAddItem(lot.lotId)} */}
{/*                   > */}
{/*                     Add Item */}
{/*                   </Dropdown.Item> */}

{/*                 <Dropdown.Item */}
{/*                   disabled={ */}
{/*                     ["pending", "delivered"].includes(lot.status?.toLowerCase()) */}
{/*                   } */}
{/*                   onClick={() => { */}
{/*                     if (!["pending", "delivered"].includes(lot.status?.toLowerCase())) { */}
{/*                       onAddItem(lot.lotId); */}
{/*                     } */}
{/*                   }} */}
{/*                 > */}
{/*                   Add Item */}
{/*                 </Dropdown.Item> */}

                <span
                  title={
                    ["pending", "delivered"].includes(lot.status?.toLowerCase())
                      ? "You can only add items when the lot is Active or Inactive"
                      : ""
                  }
                >
                  <Dropdown.Item
                    disabled={["pending", "delivered"].includes(lot.status?.toLowerCase())}
                    onClick={() => {
                      if (!["pending", "delivered"].includes(lot.status?.toLowerCase())) {
                        onAddItem(lot.lotId);
                      }
                    }}
                    style={{
                      cursor: ["pending", "delivered"].includes(lot.status?.toLowerCase())
                        ? "not-allowed"
                        : "pointer",
                      pointerEvents: ["pending", "delivered"].includes(lot.status?.toLowerCase())
                        ? "none"
                        : "auto"
                    }}
                  >
                    Add Item
                  </Dropdown.Item>
                </span>


                  <Dropdown.Item
                    onClick={() => onEditLot(lot)}
                  >
                    Edit Lot
                  </Dropdown.Item>

                </Dropdown.Menu>
              </Dropdown>

            </div>
          </div>
        ))}
      </div>

      {/* Lot Details Modal */}
      {selectedLot && (
        <LotDetailsModal
          show={true}
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onItemAdded={handleLotUpdated}
        />
      )}
    </>
  );
}
