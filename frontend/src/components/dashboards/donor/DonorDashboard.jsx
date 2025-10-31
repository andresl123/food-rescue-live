import React, { useEffect, useState } from "react";
 import { getLots, getFoodItemsByLot } from "../../../services/lotService";
import { jwtDecode } from "jwt-decode";
import CreateLotModal from "./CreateLotModal";
import FoodItemModal from "./FoodItemModal";
import EditLotModal from "./EditLotModal";
import DonorStatsCards from "./DonorStatsCards";
import DonationList from "./DonationList";

export default function DonorDashboard() {
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pickedUp: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({ name: "User" });
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  // -------------------- HANDLERS --------------------
  const handleEditLot = (lot) => {
    setSelectedLot(lot);
    setShowEditModal(true);
  };

  const handleAddItem = (lotId) => {
    setSelectedLotId(lotId);
    setShowFoodModal(true);
  };

  // -------------------- JWT DECODE --------------------
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

  // -------------------- FETCH LOTS --------------------


  const fetchLots = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await getLots(token);

      if (!response.success || !Array.isArray(response.data)) {
        setError("Failed to load donor dashboard.");
        setLoading(false);
        return;
      }

      // ✅ Fetch food item counts in parallel, but safely
      const lotsWithCounts = await Promise.all(
        response.data.map(async (lot) => {
          try {
            const lotId = lot.lotId || lot.id || lot._id;

            const itemsResponse = await getFoodItemsByLot(lotId);

            // ✅ Safely extract items array
            const items =
              itemsResponse.success && Array.isArray(itemsResponse.data)
                ? itemsResponse.data
                : [];

            // ✅ Count + Attach items directly
            return {
              ...lot,
              totalItems: items.length,
              items, // attach the full array for modal use
            };
          } catch (err) {
            console.warn(`Error fetching items for lot ${lot.id || lot._id}:`, err);
            return { ...lot, totalItems: 0, items: [] };
          }
        })
      );

      setLots(lotsWithCounts);

      setStats({
        total: lotsWithCounts.length,
        pending: lotsWithCounts.filter(
          (l) => l.status?.toLowerCase() === "pending"
        ).length,
        pickedUp: lotsWithCounts.filter(
          (l) => l.status?.toLowerCase() === "picked up"
        ).length,
        delivered: lotsWithCounts.filter(
          (l) => l.status?.toLowerCase() === "delivered"
        ).length,
      });
    } catch (err) {
      console.error("Error loading lots:", err);
      setError("Unexpected error while loading lots.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLots();
  }, []);

  // -------------------- LOADING --------------------
  if (loading)
    return (
      <div className="text-center mt-5 text-secondary">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );

  // -------------------- MAIN RETURN --------------------
  return (
    <div
      className="container-fluid px-4 py-4"
      style={{
        background: "linear-gradient(to bottom, #f9fdf9, #ffffff)",
        minHeight: "100vh",
      }}
    >
      {/* -------------------- HEADER -------------------- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Left: Title + subtitle */}
        <div>
          <h2
            className=" mb-1"
            style={{
              color: "#111827",
              fontSize: "1.75rem",
              letterSpacing: "-0.5px",
            }}
          >
            Donor Dashboard
          </h2>
          <p
            className="mb-0"
            style={{
              color: "#6b7280",
              fontSize: "1rem",
              fontWeight: 300,
            }}
          >
            Manage your food donations and track your community impact
          </p>
        </div>

        {/* Right: Create button */}
        <button
          className="btn fw-semibold"
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: "#111827",
            color: "white",
            borderRadius: "10px",
            padding: "10px 20px",
            fontSize: "0.95rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#000";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#111827";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Create New Lot
        </button>
      </div>

      {/* -------------------- STATS -------------------- */}
      <DonorStatsCards stats={stats} />

      {/* -------------------- MAIN GRID -------------------- */}
      <div className="row mt-4">
        {/* Left: Food Lots */}
        <div className="col-lg-8">
          <div
            className="bg-white shadow-sm rounded-4 p-4 mb-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="mb-4">
              {/* Heading + subtitle */}
              <div className="mb-3">
                <h5
                  className="fw-semibold mb-1"
                  style={{ color: "#111827", fontSize: "1.15rem" }}
                >
                  Your Food Lots
                </h5>
                <p
                  className="mb-0"
                  style={{ color: "#6b7280", fontSize: "0.95rem", fontWeight: 500 }}
                >
                  Manage and track your listed items
                </p>
              </div>

              {/* Toggle bar */}
              <div
                className="d-flex bg-light rounded-pill p-1 mt-2"
                style={{
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <button
                  className="btn rounded-pill fw-semibold flex-fill py-2"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    fontSize: "0.95rem",
                    border: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  Active
                </button>
                <button
                  className="btn rounded-pill fw-semibold flex-fill py-2"
                  style={{
                    backgroundColor: "transparent",
                    color: "#111827",
                    fontSize: "0.95rem",
                    border: "none",
                  }}
                >
                  Delivered
                </button>
              </div>

            </div>

            <DonationList
              donations={lots}
              onAddItem={handleAddItem}
              onEditLot={handleEditLot}
            />
          </div>
        </div>

        {/* Right: Activity + Tips */}
        <div className="col-lg-4">
          {/* Recent Activity */}
          <div
            className="bg-white shadow-sm rounded-4 p-4 mb-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <h5
             className="fw-semibold mb-1"
              style={{ color: "#111827", fontSize: "1.15rem" }}
                >
              Your Recent Activity
            </h5>
            <p
              className="mb-4"
              style={{ color: "#6b7280", fontSize: "0.95rem", fontWeight: 500 }}
            >
              Latest interactions with your lots
            </p>
            <div className="d-flex flex-column gap-3">
              {[
                {
                  initials: "SM",
                  name: "Sarah M.",
                  action: "reserved",
                  lot: "Fresh Organic Vegetables Bundle",
                  time: "2 hours ago",
                },
                {
                  initials: "JD",
                  name: "John D.",
                  action: "interested",
                  lot: "Artisan Bread Collection",
                  time: "5 hours ago",
                },
                {
                  initials: "EW",
                  name: "Emma W.",
                  action: "collected",
                  lot: "Prepared Meal Kits",
                  time: "1 day ago",
                },
              ].map((a, i) => (
                <div key={i} className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "36px", height: "36px" }}
                  >
                    <span className="text-secondary fw-semibold">
                      {a.initials}
                    </span>
                  </div>
                  <div>
                    <p className="mb-0 fw-semibold text-dark">
                      {a.name} {a.action}
                    </p>
                    <small className="text-muted">
                      {a.lot} · {a.time}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for Success */}
          <div
            className="bg-white shadow-sm rounded-4 p-4 mt-3"
            style={{
              border: "1px solid #e5e7eb",
            }}
          >
            <h6
              className="fw-semibold mb-4"
              style={{ color: "#111827", fontSize: "1.05rem" }}
            >
              Tips for Success
            </h6>

            <ul className="list-unstyled d-flex flex-column gap-4 mb-0">
              {/* Tip 1 */}
              <li className="d-flex align-items-start">
                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.1)",
                    color: "#16a34a",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                  }}
                >
                  <i className="bi bi-check-circle" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <h6
                    className="fw-semibold mb-1"
                    style={{ color: "#111827", fontSize: "0.95rem" }}
                  >
                    Add clear photos
                  </h6>
                  <p className="mb-0" style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                    Lots with photos get 3x more interest
                  </p>
                </div>
              </li>

              {/* Tip 2 */}
              <li className="d-flex align-items-start">
                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: "rgba(59,130,246,0.1)",
                    color: "#2563eb",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                  }}
                >
                  <i className="bi bi-clock" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <h6
                    className="fw-semibold mb-1"
                    style={{ color: "#111827", fontSize: "0.95rem" }}
                  >
                    Flexible pickup times
                  </h6>
                  <p className="mb-0" style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                    Wider windows help more people
                  </p>
                </div>
              </li>

              {/* Tip 3 */}
              <li className="d-flex align-items-start">
                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    backgroundColor: "rgba(168,85,247,0.1)",
                    color: "#9333ea",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                  }}
                >
                  <i className="bi bi-exclamation-circle" style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <h6
                    className="fw-semibold mb-1"
                    style={{ color: "#111827", fontSize: "0.95rem" }}
                  >
                    Update availability
                  </h6>
                  <p className="mb-0" style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                    Keep quantities current for better trust
                  </p>
                </div>
              </li>
            </ul>
          </div>


        </div>
      </div>

      {/* -------------------- MODALS -------------------- */}
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
