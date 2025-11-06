import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import LotDetailsModal from "./LotDetailsModal"; // ✅ import the modal

export default function DonationList({ donations, onAddItem, onEditLot }) {
  const [selectedLot, setSelectedLot] = useState(null);

  const handleViewDetails = (lot) => setSelectedLot(lot);

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
        <p className="mb-0 fw-semibold">No lots created yet</p>
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
                  width: "70px",
                  height: "70px",
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
                <div className="text-muted small">
                  {lot.totalItems || 0} items •{" "}
                  {new Date(lot.created_at || lot.createdAt).toLocaleDateString()}
                </div>
                <span
                  className={`badge rounded-pill mt-2 px-3 py-1 fw-semibold`}
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor:
                      lot.status?.toLowerCase() === "active"
                        ? "#dcfce7" // light green bg
                        : lot.status?.toLowerCase() === "pending"
                        ? "#fff7ed" // orange bg (same as expiring soon)
                        : lot.status?.toLowerCase() === "expiring_soon"
                        ? "#f97316" // solid orange bg
                        : lot.status?.toLowerCase() === "inactive"
                        ? "#000000" // black bg
                        : lot.status?.toLowerCase() === "delivered"
                        ? "#dbeafe" // light blue bg
                        : "#f3f4f6",

                    color:
                      lot.status?.toLowerCase() === "active"
                        ? "#166534" // dark green text
                        : lot.status?.toLowerCase() === "pending"
                        ? "#b45309" // dark orange text (same as expiring soon)
                        : lot.status?.toLowerCase() === "expiring_soon"
                        ? "#ffffff" // white text for orange bg
                        : lot.status?.toLowerCase() === "inactive"
                        ? "#ffffff" // white text for black bg
                        : lot.status?.toLowerCase() === "delivered"
                        ? "#1e3a8a" // deep blue text
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

              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="btn btn-light border-0 rounded-circle p-2 dropdown-toggle-no-caret"
                  style={{ width: "38px", height: "38px" }}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => onAddItem(lot.lotId)}
                  >
                    Add Item
                  </Dropdown.Item>
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
        />
      )}
    </>
  );
}
