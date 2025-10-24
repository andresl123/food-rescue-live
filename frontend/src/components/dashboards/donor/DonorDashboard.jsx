import React, { useEffect, useState } from "react";
import { getLots } from "../../../services/lotService";
import { mockSession } from "../../../mock/mockSession";
import DonorStatsCards from "./DonorStatsCards";
import DonationList from "./DonationList";
import CreateLotModal from "./CreateLotModal";

export default function DonorDashboard() {
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, pickedUp: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchLots = async () => {
    setLoading(true);
    const response = await getLots();
    if (response.success && response.data) {
      setLots(response.data);
      setStats({
        total: response.data.length,
        pending: response.data.filter(l => l.status?.toLowerCase() === "pending").length,
        pickedUp: response.data.filter(l => l.status?.toLowerCase() === "picked up").length,
        delivered: response.data.filter(l => l.status?.toLowerCase() === "delivered").length,
      });
    } else {
      setError(response.message || "Failed to load donor dashboard.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLots();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5 text-light">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-2">Loading donor dashboard...</p>
      </div>
    );

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Donor Dashboard</h3>
          <p className="text-secondary mb-0">Overview of your donation activity</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary">Welcome, <strong>{mockSession.name}</strong></span>
          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowModal(true)}
          >
            + Create Lot
          </button>
        </div>
      </div>

      <DonorStatsCards stats={stats} />
      <div className="mt-4">
        <DonationList donations={lots} />
      </div>

      <CreateLotModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onLotCreated={fetchLots}
      />
    </div>
  );
}
