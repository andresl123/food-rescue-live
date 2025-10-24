// src/components/dashboards/donor/DonationList.jsx
import React from "react";

export default function DonationList({ donations }) {
  const statusColor = { Pending: "warning", "Picked Up": "info", Delivered: "success" };

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
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-secondary">No donations yet.</td>
                </tr>
              ) : (
                donations.map((l, i) => (
                  <tr key={i}>
                    <td>{l.id || l.lotId}</td>
                    <td>{l.description}</td>
                    <td>
                      <span className={`badge bg-${statusColor[l.status] || "secondary"}`}>{l.status}</span>
                    </td>
                    <td>{l.totalItems}</td>
                    <td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}</td>
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
