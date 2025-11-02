import React, { useEffect, useState } from "react";
import FoodItemList from "./FoodItemList";

export default function DonationList({ donations, onAddItem, onEditLot }) {
  const [expandedLots, setExpandedLots] = useState([]);

  const toggleExpand = (lotId) => {
    setExpandedLots((prev) =>
      prev.includes(lotId)
        ? prev.filter((id) => id !== lotId)
        : [...prev, lotId]
    );
  };

  const statusColor = {
    open: "success",
    pending: "warning",
    delivered: "info",
    inactive: "secondary",
  };


  return (
    <div className="card bg-secondary bg-opacity-10 border-0 shadow-sm text-light">
      <div className="card-body">
        <h5 className="card-title mb-3">Recent Donations</h5>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted">
                <th>Lot ID</th>
                <th>Description</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-secondary">No donations yet.</td>
                </tr>
              ) : (
                donations.map((lot, i) => (
                  <React.Fragment key={i}>
                    {/* Lot row */}
                    <tr>
                      <td>{lot.lotId}</td>
                      <td>{lot.description}</td>
                      <td>
                        <span className={`badge bg-${lot.status?.toLowerCase() === "open" ? "success" : "secondary"}`}>
                          {lot.status || "N/A"}
                        </span>
                      </td>
                      <td>{lot.totalItems || 0}</td>
                      <td>
                        {lot.created_at || lot.createdAt
                          ? new Date(lot.created_at || lot.createdAt).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        {/* ACTION BUTTONS */}
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => onAddItem(lot.lotId)}
                          disabled={lot.status?.toLowerCase() !== "open"}
                        >
                          + Add Item
                        </button>

                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => onEditLot(lot)}
                          disabled={lot.status?.toLowerCase() !== "open"}
                        >
                          ✏️ Edit Lot
                        </button>

                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => toggleExpand(lot.lotId)}
                        >
                          {expandedLots.includes(lot._id) ? "▲ Collapse" : "▼ Expand"}
                        </button>
                      </td>
                    </tr>

                    {/* Food Items Section */}
                    {expandedLots.includes(lot.lotId) && (
                      <tr>
                        <td colSpan="6" className="bg-dark bg-opacity-10">
                          <FoodItemList lotId={lot.lotId} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
