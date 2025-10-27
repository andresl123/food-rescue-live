import React, { useEffect, useState } from "react";
import { getLots } from "../../../services/lotService";
import { jwtDecode } from "jwt-decode";
import DonorStatsCards from "./DonorStatsCards";
import DonationList from "./DonationList";
import CreateLotModal from "./CreateLotModal";
import FoodItemModal from "./FoodItemModal";
import EditLotModal from "./EditLotModal";

export default function DonorDashboard() {
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, pickedUp: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({ name: "User" });
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  const handleEditLot = (lot) => {
    setSelectedLot(lot);
    console.log("Edit Lot: ", lot);
    setShowEditModal(true);
  };


  const handleAddItem = (lotId) => {
    setSelectedLotId(lotId);
    setShowFoodModal(true);
  };

  // Decode user info from JWT
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.email?.split("@")[0] || "User",
          role: decoded.roles?.[0] || "",
        });
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);


  const fetchLots = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    const response = await getLots(token); // pass token to your service

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
          <span className="text-secondary">
            Welcome, <strong>{user.name}</strong>
          </span>
          <button className="btn btn-success btn-sm" onClick={() => setShowModal(true)}>
            + Create Lot
          </button>
        </div>
      </div>

      <DonorStatsCards stats={stats} />
      <div className="mt-4">
        <DonationList
              donations={lots}
              onAddItem={handleAddItem}
              onEditLot={handleEditLot}
            />
      </div>

      <CreateLotModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onLotCreated={fetchLots}
      />

      <FoodItemModal
        show={showFoodModal}
        lotId={selectedLotId}
        onClose={() => setShowFoodModal(false)}
        onItemAdded={fetchLots}
      />

      <EditLotModal
        show={showEditModal}
        lot={selectedLot}
        onClose={() => setShowEditModal(false)}
        onLotUpdated={fetchLots}
      />


    </div>



  );
}
