import React from "react";

export default function DonationList({ donations, onAddItem }) {
  const statusColor = {
    Pending: "warning",
    "Picked Up": "info",
    Delivered: "success",
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
                  <td colSpan="6" className="text-center text-secondary">
                    No donations yet.
                  </td>
                </tr>
              ) : (
                donations.map((lot, index) => (
                  <tr key={index}>
                    <td>{lot.id || lot.lotId}</td>
                    <td>{lot.description}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          statusColor[lot.status] || "secondary"
                        }`}
                      >
                        {lot.status}
                      </span>
                    </td>
                    <td>{lot.totalItems}</td>
                    <td>
                      {lot.createdAt
                        ? new Date(lot.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => onAddItem(lot.id || lot.lotId)}
                      >
                        + Add Food Item
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
